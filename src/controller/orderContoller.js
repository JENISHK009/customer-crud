import { customerModel, orderModel, productModel } from '../models/index.js';
import { validateObjectId, handleError } from '../utils/index.js'

const getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await orderModel.aggregate([
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $unwind: '$customer'
            },
            {
                $unwind: '$productIds'
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productIds',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'
            },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'orderId',
                    as: 'paymentDetails'
                }
            },
            {
                $unwind: {
                    path: '$paymentDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    customer: { $first: '$customer' },
                    orderDate: { $first: '$orderDate' },
                    status: { $first: '$status' },
                    totalAmount: { $first: '$totalAmount' },
                    shippingAddress: { $first: '$shippingAddress' },
                    products: { $push: '$productDetails' },
                    paymentDetails: { $first: '$paymentDetails' }
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
                    customerName: { $concat: ['$customer.firstname', ' ', '$customer.lastname'] },
                    customerMobileNumber: '$customer.mobileNumber',
                    orderDate: 1,
                    status: 1,
                    totalAmount: 1,
                    shippingAddress: 1,
                    products: {
                        name: 1,
                        price: 1,
                        description: 1,
                        category: 1,
                        stock: 1
                    },
                    paymentDetails: {
                        amount: 1,
                        paymentMethod: 1,
                        paymentDate: 1,
                        status: 1
                    }
                }
            }
        ]);

        res.status(200).send({ success: true, data: orderDetails });
    } catch (error) {
        handleError(res, error);
    }
};


const addOrder = async (req, res) => {
    try {
        const { customerId, productIds, orderDate, totalAmount, shippingAddress } = req.body;

        if (!customerId || !productIds || !orderDate || !totalAmount || !shippingAddress) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        if (!validateObjectId(customerId, res)) return;

        for (let productId of productIds) {
            if (!validateObjectId(productId, res)) return;
        }

        const customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        const products = await productModel.find({ _id: { $in: productIds } });
        if (products.length !== productIds.length) {
            return res.status(404).send({ success: false, message: "One or more products not found" });
        }

        const newOrder = new orderModel({
            customerId,
            productIds,
            orderDate,
            status: 'Pending',
            totalAmount,
            shippingAddress
        });

        const savedOrder = await newOrder.save();
        res.status(200).send({ success: true, message: "Order created successfully", data: savedOrder });
    } catch (error) {
        console.log(error)
        handleError(res, error);
    }
};
export default {
    getOrderDetails,
    addOrder
};
