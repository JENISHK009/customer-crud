import { customerModel } from '../models/index.js';
import { getConnection } from '../config/index.js'
import { ObjectId } from 'mongodb';
import { validateObjectId, handleError, validateMobileNumber } from '../utils/index.js'

const createCustomer = async (req, res) => {
    try {
        const { firstname, lastname, mobileNumber } = req.body;

        const validationErrors = [];
        if (!firstname) validationErrors.push('firstname');
        if (!lastname) validationErrors.push('lastname');
        if (!mobileNumber) validationErrors.push('mobileNumber');

        if (validationErrors.length > 0) {
            return res.status(400).send({ success: false, message: `${validationErrors.join(", ")} is required` });
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
        const db = getConnection('createDatabaseConnection');
        const CustomerModel = db.model('Customer', customerModel.schema);

        const customers = await CustomerModel.find();
        res.status(200).send({ success: true, data: customers });
    } catch (error) {
        handleError(res, error);
    }
};

const getCustomerById = async ({ query }, res) => {
    try {
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

        if (!validateObjectId(customerId, res)) return;

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).send({ success: false, message: "Please pass data" });
        }

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
        const db = getConnection('connectUsingMongodb');     // DB connection method 4
        const customersCollection = db.collection('customers');

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
