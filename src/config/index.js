import mongoose from "mongoose";
import { MongoClient } from "mongodb";


const connectToDataBase = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected Successfully");
    } catch (error) {
        console.log("Connection failed");
    }
};

const createDatabaseConnection = async () => {
    try {
        const connection = mongoose.createConnection(process.env.DATABASE_URL);

        connection.on("connected", () => {
            console.log("Connected using mongoose.createConnection()");
        });

        connection.on("error", (err) => {
            console.log("Connection failed ", err);
        });

        return connection;
    } catch (error) {
        console.log("Connection failed");
    }
};

const connectToDatabasePromise = async () => {
    return mongoose
        .connect(process.env.DATABASE_URL)
        .then(() => {
            console.log(
                "Connected Successfully using mongoose.connect() with Promises"
            );
        })
        .catch((error) => {
            console.log(
                "Connection failed using mongoose.connect() with Promises",
                error
            );
        });
};

const connectUsingMongodb = async () => {
    const uri = process.env.DATABASE_URL_MONGODB;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('customer-crud');

    } catch (error) {
        console.error('Error connecting:', error);
    }
}


export {
    connectToDataBase,
    createDatabaseConnection,
    connectToDatabasePromise,
    connectUsingMongodb
};
