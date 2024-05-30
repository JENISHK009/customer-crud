import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
}, { versionKey: false });

const seller = mongoose.model('seller', sellerSchema);

export default seller;
