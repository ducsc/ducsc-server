const mongoose = require('mongoose');


// connecting to db
const connectDB = () => {
    mongoose.connect('mongodb://dsc:DNYs67BakjfdBB3@ds261527.mlab.com:61527/dsc-member_list',{ useNewUrlParser: true }).then(()=> console.log('Conected to DB...'));
    }
// creating schema and model
const memberSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: String,
    roll: Number,
    message: String,
    memberId: String,
    photo: Buffer,
    batch: String,
    shift: String,
    section: String,
    password: String});

    const Member = mongoose.model('New-Members', memberSchema);



const getMembers = async () => {
    await connectDB();
    const result = await Member.find();
    await mongoose.connection.close().then(()=> console.log('closed DB connection...'));
    return result;
};

const getMembersEmail = async () => {
    allUsersD = await getMembers();
    let result = allUsersD.map(a => a.email);
    let fresult = result.toString();
    // console.log(fresult);
    return fresult;
    }
    

// function for creating member
    const createMember = async (memberInfo) => {
        connectDB();
        let member = new Member(memberInfo);
        const result = await member.save();
        console.log(result);
        mongoose.connection.close().then(()=> console.log('closed DB connection...'));
    };
// function for getting all members
    // const getMembers = async () => {
    //     await connectDB();
    //     const result = await Member.find();
    //     await mongoose.connection.close().then(()=> console.log('closed DB connection...'));
    //     return result;
    // };
    // function for getting member by login data

    const getMemberByLoginData = async (memberEmail, memberPassword) => {
        await connectDB();
        const result = await Member.find({email:memberEmail, password: memberPassword});
        await mongoose.connection.close().then(()=> console.log('closed DB connection...'));
        return result;
    };
// function for getting member by email

    let reqUser = "requested user";
    const getMemberByEmail = async (memberEmail) => {
        connectDB();

        const result = await Member.find({email: memberEmail});
        reqUser = result;
        mongoose.connection.close().then(()=> console.log('closed DB connection...'));
    };
// function for getting member by password

    const getMemberByPassword = async (memberPassword) => {
        connectDB();

        const result = await Member.find({password: memberPassword});
        reqUser = result;
        mongoose.connection.close().then(()=> console.log('closed DB connection...'));

    };
exports = allFunction