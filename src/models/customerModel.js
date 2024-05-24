import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true
    },
    points: {
        type: Number,
    }
}, { versionKey: false });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
