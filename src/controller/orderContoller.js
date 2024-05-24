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
                $lookup: {
                    from: 'products',
                    localField: 'productIds',
                    foreignField: '_id',
                    as: 'productDetails'
                }
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
                $addFields: {
                    products: {
                        $map: {
                            input: '$productDetails',
                            as: 'product',
                            in: {
                                name: '$$product.name',
                                price: '$$product.price',
                                description: '$$product.description',
                                category: '$$product.category',
                                stock: '$$product.stock'
                            }
                        }
                    },
                    customerName: { $concat: ['$customer.firstname', ' ', '$customer.lastname'] },
                    customerMobileNumber: '$customer.mobileNumber',
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
                    products: { $first: '$products' },
                    paymentDetails: { $first: '$paymentDetails' }
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
                    customerName: 1,
                    customerMobileNumber: 1,
                    orderDate: 1,
                    status: 1,
                    totalAmount: 1,
                    shippingAddress: 1,
                    products: 1,
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
        const body = req.body;

        if (!Array.isArray(body) || body.length === 0)
            throw new Error("Please add valid order data");


        const orderPromises = body.map(async (order) => {
            const { customerId, productIds, orderDate, totalAmount, shippingAddress } = order;

            if (!customerId || !productIds || !orderDate || !totalAmount || !shippingAddress)
                throw new Error("All fields are required");


            if (!validateObjectId(customerId, res)) throw new Error("Invalid customerId");

            if (!productIds.every(id => validateObjectId(id, res))) throw new Error("Invalid productIds");

            const [customer, products] = await Promise.all([
                customerModel.findById(customerId),
                productModel.find({ _id: { $in: productIds } })
            ]);

            if (!customer) throw new Error("Customer not found");

            if (products.length !== productIds.length) throw new Error("products not found");

            return {
                customerId,
                productIds,
                orderDate,
                status: 'Pending',
                totalAmount,
                shippingAddress
            };
        });

        const validatedOrders = await Promise.all(orderPromises);

        const savedOrders = await orderModel.insertMany(validatedOrders);
        res.status(200).send({ success: true, message: "Orders created successfully", data: savedOrders });
    } catch (error) {
        console.log(error);
        handleError(res, error);
    }
};



export default {
    getOrderDetails,
    addOrder
};
