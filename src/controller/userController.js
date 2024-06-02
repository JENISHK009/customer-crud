import { validateObjectId, handleError } from '../utils/index.js'
import { getConnection } from '../config/index.js';
import { ObjectId } from "mongodb";

const reportForReferal = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb"); // DB connection method 4
        const db = client.db("customer-crud");
        const usersCollection = db.collection("users");

        let { startDate, endDate } = req.query;

        let userReport = await usersCollection.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'referral',
                    foreignField: '_id',
                    as: 'referredUser'
                }
            },
            {
                $unwind: {
                    path: '$referredUser',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'plUsers',
                    let: { referredUserId: '$referredUser._id', userId: '$_id' },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$referredUserId', '$$referredUserId'] },
                                    { $eq: ['$userId', '$$userId'] },
                                    { $gte: ['$createdAt', startDate] },
                                    { $lt: ['$createdAt', endDate] }
                                ]
                            }
                        }
                    }],
                    as: 'transactions'
                }
            },
            {
                $unwind: {
                    path: '$transactions',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    referredUserCount: {
                        $sum: {
                            $cond: [{ $ifNull: ['$referredUser', false] }, 1, 0]
                        }
                    },
                    totalBonus: { $sum: '$transactions.amount' },
                    userName: { $first: "$userName" },

                }
            },
            {
                $sort: {
                    referredUserCount: -1
                }
            }
        ]).toArray();

        res.status(200).send({
            success: true,
            data: userReport
        });
    } catch (error) {
        handleError(res, error);
    }
};


export default { reportForReferal }