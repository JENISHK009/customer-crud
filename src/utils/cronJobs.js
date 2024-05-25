import cron from 'cron';
import { getConnection } from '../config/index.js';

const updatePointEverySec = new cron.CronJob('* * * * * *', async () => {
    const client = getConnection("connectUsingMongodb");
    if (!client) {
        console.error('Failed to get database connection.');
        return;
    } const session = client.startSession();

    try {

        const db = client.db('customer-crud');;
        const customersCollection = db.collection("customers");

        session.startTransaction();

        const randomCustomers = await customersCollection.find().limit(100).toArray();
        const bulkOperations = randomCustomers.map(customer => ({
            updateOne: {
                filter: { _id: customer._id },
                update: { $inc: { points: 1 } }
            }
        }));
        const result = await customersCollection.bulkWrite(bulkOperations, { session });

        await session.commitTransaction();
        console.log(`Points updated for 100 customers.`);
    } catch (error) {
        await session.abortTransaction();
        console.error(error);
    } finally {
        session.endSession();
    }
}, null, true, null);

export { updatePointEverySec }
