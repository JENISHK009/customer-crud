import { customerModel } from '../models/index.js';
import { Types } from 'mongoose';
import { createDatabaseConnection, connectToDataBase, connectToDatabasePromise, connectUsingMongodb } from '../config/index.js';
import { ObjectId } from 'mongodb';

const handleError = (res, error) => {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
};

const validateObjectId = (id, res) => {
    if (!id || !Types.ObjectId.isValid(id)) {
        res.status(400).send({ success: false, message: "Invalid customerId" });
        return false;
    }
    return true;
};

const validateMobileNumber = (mobileNumber, res) => {
    const mobileNumberPattern = /^\d{10}$/;
    if (!mobileNumberPattern.test(mobileNumber)) {
        res.status(400).send({ success: false, message: "Invalid mobile number" });
        return false;
    }
    return true;
};

const createCustomer = async ({ body }, res) => {
    try {
        await connectToDataBase(); // DB connection method 1
        const { firstname, lastname, mobileNumber } = body;

        if (!firstname || !lastname || !mobileNumber) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        if (!validateMobileNumber(mobileNumber, res)) return;

        const customer = new customerModel({ firstname, lastname, mobileNumber });
        const savedCustomer = await customer.save();

        res.status(200).send({ success: true, message: "Customer created successfully", data: savedCustomer });
    } catch (error) {
        handleError(res, error);
    }
};

const getAllCustomers = async (_, res) => {
    try {
        const connection = await createDatabaseConnection(); // DB connection method 2
        const CustomerModel = connection.model('Customer', customerModel.schema);

        const customers = await CustomerModel.find();
        res.status(200).send({ success: true, data: customers });
    } catch (error) {
        handleError(res, error);
    }
};

const getCustomerById = async ({ query }, res) => {
    try {
        await connectToDatabasePromise(); // DB connection method 3

        const { customerId } = query;

        if (!validateObjectId(customerId, res)) return;

        const customer = await customerModel.findById(customerId);

        if (!customer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, data: customer });
    } catch (error) {
        handleError(res, error);
    }
};

const updateCustomer = async ({ body }, res) => {
    try {
        const { customerId, updatedData } = body;

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).send({ success: false, message: "Please pass data" });
        }

        await connectToDataBase(); // DB connection method 1
        const customer = await customerModel.findByIdAndUpdate(customerId, updatedData, { new: true });

        if (!customer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, data: customer });
    } catch (error) {
        handleError(res, error);
    }
};

const deleteCustomer = async ({ query }, res) => {
    try {
        let connection = await connectUsingMongodb(); // DB connection method 4
        const customersCollection = connection.collection('customers');

        const { customerId } = query;
        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

        const deletedCustomer = await customersCollection.findOneAndDelete({ _id: new ObjectId(customerId) });
        if (!deletedCustomer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, message: deletedCustomer });
    } catch (error) {
        handleError(res, error);
    }
};

export default {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};
