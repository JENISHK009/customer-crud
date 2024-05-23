import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const orderSchema = new mongoose.Schema({
    customerId: {
        type: Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    orderDate: {
        type: Date,
        required: true
    },
    productIds: [
        {
            type: Types.ObjectId,
            ref: 'Product',
            required: true
        }
    ],
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    }
}, { versionKey: false });

const order = mongoose.model('order', orderSchema);

export default order;
