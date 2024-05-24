import cron from 'cron';
import { getConnection } from '../config/index.js';

const updatePointEverySec = new cron.CronJob('* * * * * *', async () => {
    try {
        const db = getConnection("connectUsingMongodb");
        const customersCollection = db.collection("customers");

        const randomCustomers = await customersCollection.find().limit(100).toArray();

        const bulkOperations = randomCustomers.map(customer => ({
            updateOne: {
                filter: { _id: customer._id },
                update: { $inc: { points: 1 } }
            }
        }));

        const result = await customersCollection.bulkWrite(bulkOperations);

        console.log('Points updated for 100 customers.');
    } catch (error) {
        console.error('Error updating points:', error);
    }
}, null, true, null);

export { updatePointEverySec }