import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const connections = {};

const connectToDataBase = async (uri) => {
    if (!connections['connectToDataBase']) {
        try {
            await mongoose.connect(uri);
            console.log("Connected Successfully");
            connections['connectToDataBase'] = mongoose.connection;
        } catch (error) {
            console.log("Connection failed");
        }
    }
};

const createDatabaseConnection = async (uri) => {
    try {
        if (!connections['createDatabaseConnection']) {

            const connection = mongoose.createConnection(uri);

            connection.on("connected", () => {
                console.log("Connected using mongoose.createConnection()");
            });

            connection.on("error", (err) => {
                console.log("Connection failed ", err);
            });
            connections['createDatabaseConnection'] = connection;
        }
        return connections['createDatabaseConnection'];
    } catch (error) {
        console.log("Connection failed");
    }
};

const connectToDatabasePromise = async (uri) => {
    if (!connections['connectToDatabasePromise']) {
        try {
            connections['connectToDatabasePromise'] = await mongoose.connect(uri);
            console.log("Connected Successfully using mongoose.connect() with Promises");
        } catch (error) {
            console.log("Connection failed using mongoose.connect() with Promises", error);
        }
    }
    return connections['connectToDatabasePromise'];
};

const connectUsingMongodb = async (uri) => {
    if (!connections['connectUsingMongodb']) {
        const client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB using MongoClient');
        connections['connectUsingMongodb'] = client.db('customer-crud');
    }
    return connections['connectUsingMongodb'];
}
const initializeConnections = async () => {
    await connectToDataBase(process.env.DATABASE_URL);
    await createDatabaseConnection(process.env.DATABASE_URL);
    await connectToDatabasePromise(process.env.DATABASE_URL);
    await connectUsingMongodb(process.env.DATABASE_URL_MONGODB);

};

const getConnection = (method) => {
    return connections[method];
};

export { initializeConnections, getConnection };

