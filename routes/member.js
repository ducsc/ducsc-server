// all the neccessery packages
const { auth } = require('../middleware/auth');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { thankYou } = require('../modules/tempHTML');
const { validate } = require('../models/member');
const config = require('config');
const imgur = require('../modules/imgur');
const upload = require('../modules/multer');
const db = require('../modules/db');
const ftp = require('../modules/ftp');
const mailer = require('../modules/mailer');
const express = require('express');
const router = express.Router();
const { Member } = require('../models/member');

router.use(express.urlencoded({ extended: true }));


// getting all the members
router.get('/', async (req, res) => {
    const result = await Member.find().select('-_id -password -passwordReset');
    res.header({ 'Access-Control-Allow-Origin': '*'}).json(result);
});
// login and registration endpoints
router.post('/update-image', auth, upload.upd.single('newImage'), async (req, res) => {
    try {
        const imgurLink = await imgur.uploadImg(`public/members-image/${req.file.filename}`);
        const newImages = { photo: [imgurLink, `${config.get('ftp.server-address')}/${req.file.filename}`] }
        const result = await db.updateOneMember(req.member.memberId, newImages);
        ftp.putFile(`public/members-image/${req.file.filename}`, `htdocs/test/${req.file.filename}`);
        res.redirect('/me');
    }
    catch {
        res.send('Failed to update image...')
    }
});

router.get('/reset/getlink', async (req, res) => {
    let result = await Member.findOne({ roll: req.query.roll });
    if (result) {
        let resetData = await Member.findOneAndUpdate({ roll: req.query.roll }, {
            $set: {
                passwordReset: [Math.random(), Date.now()]
            }}, {new: true}
        )
        let link = resetData.passwordReset[0];
        // console.log(resetData + result);

        res.send('We sent you an email with a link to reset your password. The link will expire in 10 minutes')

        mailer.sendEmailForPassReset(result.email, 'https://dscapi.herokuapp.com/member/reset/setpassword?roll=' + result.roll + '&t=' + link)
        return;
    }
    res.send('No member found with the given roll.')
});

router.get('/reset/setpassword', async (req, res) => {
    const result = await Member.findOne({ roll: req.query.roll });
    const resettable = result.passwordReset[0] == req.query.t && ((Date.now() - result.passwordReset[1]) < 600000)
    console.log('time: '+(Date.now() - result.passwordReset[1]));
    console.log( result.passwordReset[0] == req.query.t);
    console.log( result.passwordReset[0] +'=='+ req.query.t);
    console.log( (Date.now() - result.passwordReset[1]) < 600000);
    
    if (resettable) return res.send(`<form action=/member${req.url} method='post'><input name='newpassword' placeholder='New Password'><input type='submit' value='Submit'></form>` )    
    res.send('Invalid reset URL');


});

router.post('/reset/setpassword', async (req, res) => {
    const result = await Member.findOne({ roll: req.query.roll });
    const resettable = result.passwordReset[0] == req.query.t && ((Date.now() - result.passwordReset[1]) < 600000);
    if (resettable) {
        const salt = await bcrypt.genSalt(10);
        const newResult = await Member.findOneAndUpdate({ roll: req.query.roll }, 
           { $set: {
                password: await bcrypt.hash(req.body.newpassword, salt)
            }}, {new: true}
        )
        if (newResult) return res.send('Password reseted successfully! Now you can login with your new password')
    }
    res.send('Something went wrong.')
    
})



router.post('/update', auth, async (req, res) => {
    // const { error } = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);
    let member = req.body;
    console.log(member);

    // member = await db.getMemberByEmail(req.body.email);
    // if (member) return res.send('<br><br><br><h1>Someone has already registered with the given email address</h1>');
    // member = await db.getMemberByPhone(req.body.phone);
    // if (member) return res.send('<br><br><br><h1>Someone has already registered with the given phone number</h1>');

    member = _.pick(req.body, ['fname', 'lname', 'email', 'phone', 'bio', 'fb', 'tw', 'ig', 'memberId']);
    result = await db.updateMemberInfo(member.memberId, member);
    res.redirect('/me');
});

router.get('/', (req, res) => {
    res.render('register', null);
});


router.post('/approve/:memberId',async function (req, res) {
    const result = await db.approveMember(req.params.memberId);
    if (result){
        res.send('Member approved!')
    }
    else { res.send('Could not approve member')}
});

module.exports = router;
