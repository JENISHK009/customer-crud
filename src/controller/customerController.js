import { customerModel } from '../models/index.js';
import { Types } from 'mongoose';

const createCustomer = async (req, res) => {
    try {
        const { firstname, lastname, mobileNumber } = req.body;

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
        res.status(500).send({ success: false, error: error.message });
    }
};


const getAllCustomers = async (req, res) => {
    try {
        const customers = await customerModel.find();
        res.status(200).send({ success: true, data: customers });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
};


const getCustomerById = async (req, res) => {
    try {
        const { customerId } = req.query;

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

        const customer = await customerModel.findById(customerId);

        if (!customer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, data: customer });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
};


const updateCustomer = async (req, res) => {
    try {
        const { customerId, updatedData } = req.body;

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

        if (!updatedData || Object.keys(updatedData).length === 0) {
            return res.status(400).send({ success: false, message: "please pass data" });
        }

        const customer = await customerModel.findByIdAndUpdate(customerId, updatedData, { new: true });

        if (!customer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, data: customer });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
};


const deleteCustomer = async (req, res) => {
    try {
        const { customerId } = req.query;

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return res.status(400).send({ success: false, message: "Invalid customerId" });
        }

        const deletedCustomer = await customerModel.findByIdAndDelete(customerId);

        if (!deletedCustomer) {
            return res.status(404).send({ success: false, message: "Customer not found" });
        }

        res.status(200).send({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
};


export default {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};
