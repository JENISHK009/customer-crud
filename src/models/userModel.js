import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
    },
    referCode: {
        type: String,
    },
    referral: {
        type: Array,
    },
}, { versionKey: false });

const user = mongoose.model('user', userSchema);

export default user;
