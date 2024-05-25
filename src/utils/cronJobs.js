import cron from 'cron';
import { getConnection } from '../config/index.js';

let isPreviousCronRunning = false;

const updatePointEverySec = new cron.CronJob('* * * * * *', async () => {
    if (isPreviousCronRunning) {
        console.log('Previous cron job is still running. Skipping this execution.');
        return;
    }

    isPreviousCronRunning = true;

    try {
        const client = await getConnection("connectUsingMongodb");
        if (!client) {
            console.error('Failed to connect database');
            return;
        }

        const session = client.startSession();

        try {
            const db = client.db('customer-crud');
            const customersCollection = db.collection("customers");

            session.startTransaction();

            const randomCustomers = await customersCollection.find().limit(100).toArray();

            if (randomCustomers.length === 0) {
                console.log('No customers found to update');
                await session.abortTransaction();
                return;
            }

            const batchSize = 20;
            for (let i = 0; i < randomCustomers.length; i += batchSize) {
                const batch = randomCustomers.slice(i, i + batchSize);
                const bulkOperations = batch.map(customer => ({
                    updateOne: {
                        filter: { _id: customer._id },
                        update: { $inc: { points: 1 } }
                    }
                }));
                await customersCollection.bulkWrite(bulkOperations, { session });
                console.log(`Batch of ${batch.length} customers updated`);
            }

            await session.commitTransaction();
            console.log('Points updated for 100 customers');
        } catch (error) {
            await session.abortTransaction();
            console.error('Transaction aborted error:', error.message);
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error connecting to database:', error.message);
    } finally {
        isPreviousCronRunning = false;
    }
}, null, true, null);

export { updatePointEverySec };
