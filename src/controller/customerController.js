import { customerModel } from '../models/index.js';
import { Types } from 'mongoose';

const handleError = (res, error) => {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
};

const createCustomer = async ({ body }, res) => {
    try {
        const { firstname, lastname, mobileNumber } = body;

        if (!firstname || !lastname || !mobileNumber) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        const mobileNumberPattern = /^\d{10}$/;
        if (!mobileNumberPattern.test(mobileNumber)) {
            return res.status(400).send({ success: false, message: "Invalid mobile number" });
        }

        const customer = new customerModel({ firstname, lastname, mobileNumber });

        const savedCustomer = await customer.save();

        res.status(200).send({ success: true, message: "Customer created successfully", data: savedCustomer });
    } catch (error) {
        handleError(res, error);
    }
};

const getAllCustomers = async (_, res) => {
    try {
        const customers = await customerModel.find();
        res.status(200).send({ success: true, data: customers });
    } catch (error) {
        handleError(res, error);
    }
};

const getCustomerById = async ({ query }, res) => {
    try {
        const { customerId } = query;

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

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
        const { customerId } = query;

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

        const deletedCustomer = await customerModel.findByIdAndDelete(customerId);

        if (!deletedCustomer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, message: "Customer deleted successfully" });
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
