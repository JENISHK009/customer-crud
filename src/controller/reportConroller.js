import { handleError } from "../utils/index.js";
import { getConnection } from "../config/index.js";

const saleReport = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db("customer-crud");
        const ordersCollection = db.collection("orders");
        let query = [];
        let { filter } = req.query;
        if (!filter) throw new Error("Please pass filter")
        else if (filter == "category") {
            query = [
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                { $unwind: "$productDetails" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productDetails.categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                { $unwind: "$categoryDetails" },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        products: 1,
                        orderDate: 1,
                        status: 1,
                        totalAmount: 1,
                        shippingAddress: 1,
                        productDetails: 1,
                        sellerDetails: 1,
                        categoryDetails: {
                            $ifNull: ["$categoryDetails", "Category Not Found"],
                        },
                    },
                },
                {
                    $facet: {
                        categorySales: [
                            {
                                $group: {
                                    _id: "$categoryDetails._id",
                                    name: { $first: "$categoryDetails.name" },
                                    totalSales: { $sum: "$products.quantity" },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    totalSales: 1,
                                },
                            },
                        ],
                    },
                },
            ];
        } else if (filter == "product") {
            query = [
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                { $unwind: "$productDetails" },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        products: 1,
                        orderDate: 1,
                        status: 1,
                        totalAmount: 1,
                        shippingAddress: 1,
                        productDetails: 1,
                        sellerDetails: 1,
                    },
                },
                {
                    $facet: {
                        productSales: [
                            {
                                $group: {
                                    _id: "$productDetails._id",
                                    name: { $first: "$productDetails.name" },
                                    totalSales: { $sum: "$products.quantity" },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    totalSales: 1,
                                },
                            },
                        ],

                    },
                }
            ];
        } else if (filter == 'subcategory') {
            query = [
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                { $unwind: "$productDetails" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productDetails.categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                { $unwind: "$categoryDetails" },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "productDetails.subcategoryId",
                        foreignField: "_id",
                        as: "subcategoryDetails",
                    },
                },
                { $unwind: "$subcategoryDetails" },
                {
                    $lookup: {
                        from: "sellers",
                        localField: "products.sellerId",
                        foreignField: "_id",
                        as: "sellerDetails",
                    },
                },
                { $unwind: "$sellerDetails" },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        products: 1,
                        orderDate: 1,
                        status: 1,
                        totalAmount: 1,
                        shippingAddress: 1,
                        productDetails: 1,
                        sellerDetails: 1,
                        categoryDetails: {
                            $ifNull: ["$categoryDetails", "Category Not Found"],
                        },
                        subcategoryDetails: {
                            $ifNull: ["$subcategoryDetails", "Subcategory Not Found"],
                        },
                    },
                },
                {
                    $facet: {
                        subcategorySales: [
                            {
                                $group: {
                                    _id: "$subcategoryDetails._id",
                                    name: { $first: "$subcategoryDetails.name" },
                                    totalSales: { $sum: "$products.quantity" },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    totalSales: 1,
                                },
                            },
                        ],
                    },
                },
            ]
        } else if (filter == 'saller') {
            query = [
                { $unwind: "$products" },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productDetails",
                    },
                },
                { $unwind: "$productDetails" },
                {
                    $lookup: {
                        from: "categories",
                        localField: "productDetails.categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                { $unwind: "$categoryDetails" },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "productDetails.subcategoryId",
                        foreignField: "_id",
                        as: "subcategoryDetails",
                    },
                },
                { $unwind: "$subcategoryDetails" },
                {
                    $lookup: {
                        from: "sellers",
                        localField: "products.sellerId",
                        foreignField: "_id",
                        as: "sellerDetails",
                    },
                },
                { $unwind: "$sellerDetails" },
                {
                    $project: {
                        _id: 1,
                        customerId: 1,
                        products: 1,
                        orderDate: 1,
                        status: 1,
                        totalAmount: 1,
                        shippingAddress: 1,
                        productDetails: 1,
                        sellerDetails: 1,
                        categoryDetails: {
                            $ifNull: ["$categoryDetails", "Category Not Found"],
                        },
                        subcategoryDetails: {
                            $ifNull: ["$subcategoryDetails", "Subcategory Not Found"],
                        },
                    },
                },
                {
                    $facet: {
                        sellerSales: [
                            {
                                $group: {
                                    _id: "$sellerDetails._id",
                                    name: { $first: "$sellerDetails.name" },
                                    totalSales: { $sum: "$products.quantity" },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    name: 1,
                                    totalSales: 1,
                                },
                            },
                        ],
                    },
                },
            ]
        }
        const salesReport = await ordersCollection.aggregate(query).toArray();
        res.status(200).json({
            success: true,
            data: salesReport,
        });
    } catch (error) {
        handleError(res, error);
    }
};

export default {
    saleReport,
};
