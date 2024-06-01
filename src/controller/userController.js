import { validateObjectId, handleError } from '../utils/index.js'
import { getConnection } from '../config/index.js';
import { ObjectId } from "mongodb";

const reportForReferal = async (req, res) => {
    try {
        const client = getConnection("connectUsingMongodb"); // DB connection method 4
        const db = client.db("customer-crud");
        const usersCollection = db.collection("users");

        let { startDate, endDate, userId } = req.query

        let userReport = await usersCollection.aggregate([
            {
                $match: { _id: new ObjectId(userId) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'referral',
                    foreignField: '_id',
                    as: 'referredUser'
                }

            },
            {
                $unwind: '$referredUser'
            },
            {
                $match: { 'referredUser.createdAt': { $gte: startDate, $lt: endDate } }
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
                $unwind: '$transactions'
            },
            {
                $match: { 'transactions.createdAt': { $gte: startDate, $lt: endDate } }
            },

            {
                $group: {
                    _id: '$userName',
                    referredUserCount: { $sum: 1 },
                    totalBonus: { $sum: '$transactions.amount' },
                    referredUser: { $push: '$referredUser' }
                }
            }
        ]).toArray()

        res.status(200).send({
            success: true,
            data: userReport
        });
    } catch (error) {
        handleError(res, error);
    }
}

export default { reportForReferal }