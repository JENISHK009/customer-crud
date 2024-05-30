import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}, { versionKey: false });

const subcategory = mongoose.model('subcategory', subcategorySchema);

export default subcategory;
