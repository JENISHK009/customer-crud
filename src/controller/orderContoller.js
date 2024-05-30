import { orderModel } from "../models/index.js";
import { validateObjectId, handleError } from "../utils/index.js";
import { getConnection } from "../config/index.js";
import { ObjectId } from "mongodb";

const getOrderDetails = async (req, res) => {
    try {
        const orderDetails = await orderModel.aggregate([
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer",
                },
            },
            {
                $unwind: "$customer",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productIds",
                    foreignField: "_id",
                    as: "productDetails",
                },
            },
            {
                $lookup: {
                    from: "payments",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "paymentDetails",
                },
            },
            {
                $unwind: {
                    path: "$paymentDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$productDetails",
                            as: "product",
                            in: {
                                name: "$$product.name",
                                price: "$$product.price",
                                description: "$$product.description",
                                category: "$$product.category",
                                stock: "$$product.stock",
                            },
                        },
                    },
                    customerName: {
                        $concat: ["$customer.firstname", " ", "$customer.lastname"],
                    },
                    customerMobileNumber: "$customer.mobileNumber",
                },
            },
            {
                $group: {
                    _id: "$_id",
                    customer: { $first: "$customer" },
                    orderDate: { $first: "$orderDate" },
                    status: { $first: "$status" },
                    totalAmount: { $first: "$totalAmount" },
                    shippingAddress: { $first: "$shippingAddress" },
                    products: { $first: "$products" },
                    paymentDetails: { $first: "$paymentDetails" },
                },
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id",
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
                        status: 1,
                    },
                },
            },
        ]);

        res.status(200).send({ success: true, data: orderDetails });
    } catch (error) {
        handleError(res, error);
    }
};

const addOrder = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db("customer-crud");
        const customersCollection = db.collection("customers");
        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");

        const body = req.body;

        if (!Array.isArray(body) || body.length === 0)
            throw new Error("Please add valid order data");

        const orderPromises = body.map(async (order) => {
            const { customerId, products, orderDate, totalAmount, shippingAddress } =
                order;

            if (
                !customerId ||
                !products ||
                !orderDate ||
                !totalAmount ||
                !shippingAddress
            )
                throw new Error("All fields are required");

            if (!validateObjectId(customerId)) throw new Error("Invalid customerId");

            const customer = await customersCollection.findOne({
                _id: new ObjectId(customerId),
            });
            if (!customer) throw new Error("Customer not found");

            const productPromises = products.map(async (product) => {
                const { productId, sellerId, quantity } = product;
                if (!validateObjectId(productId) || !validateObjectId(sellerId)) {
                    throw new Error("Invalid productId or sellerId");
                }
                console.log("productId", productId);
                const productDoc = await productsCollection.findOne({
                    _id: new ObjectId(productId),
                });
                console.log(productDoc);
                if (!productDoc) throw new Error("Product or seller not found");

                const priceDetail = productDoc.prices[0];

                return {
                    productId: new ObjectId(productId),
                    sellerId: new ObjectId(sellerId),
                    quantity,
                    price: priceDetail.price,
                };
            });

            const validatedProducts = await Promise.all(productPromises);

            return {
                customerId: new ObjectId(customerId),
                products: validatedProducts,
                orderDate: new Date(orderDate),
                status: "Pending",
                totalAmount,
                shippingAddress,
            };
        });

        const validatedOrders = await Promise.all(orderPromises);

        const result = await ordersCollection.insertMany(validatedOrders);

        res
            .status(200)
            .send({
                success: true,
                message: "Orders created successfully",
                data: result.ops,
            });
    } catch (error) {
        console.log(error);
        handleError(res, error);
    }
};

export default {
    getOrderDetails,
    addOrder,
};
