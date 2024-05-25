import { ObjectId } from "mongodb";
import _ from "lodash";
import __ from "underscore";
import { customerModel } from "../models/index.js";
import { getConnection } from "../config/index.js";
import {
    validateObjectId,
    handleError,
    validateMobileNumber,
} from "../utils/index.js";

const createCustomer = async (req, res) => {
    try {
        const customersData = req.body;

        if (!Array.isArray(customersData) || customersData.length === 0)
            throw new Error("Customer data must be provided as an array");

        const validationErrors = customersData.reduce((errors, customer, index) => {
            if (!customer.firstname) errors.push(`Customer ${index + 1}: firstname`);
            if (!customer.lastname) errors.push(`Customer ${index + 1}: lastname`);
            if (!customer.mobileNumber)
                errors.push(`Customer ${index + 1}: mobileNumber`);
            return errors;
        }, []);

        if (validationErrors.length > 0) {
            return res
                .status(400)
                .send({
                    success: false,
                    message: `${validationErrors.join(", ")} is required`,
                });
        }

        const invalidMobileNumbers = customersData.filter(
            (customer) => !validateMobileNumber(customer.mobileNumber, res)
        );
        if (invalidMobileNumbers.length > 0) return;

        const savedCustomers = await customerModel.insertMany(customersData);

        res
            .status(200)
            .send({
                success: true,
                message: "Customers created successfully",
                data: savedCustomers,
            });
    } catch (error) {
        handleError(res, error);
    }
};

const getAllCustomers = async ({ query }, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db('customer-crud');
        const customersCollection = db.collection("customers");

        const { search, sort = "asc" } = query;
        const filter = search
            ? {
                $or: [
                    { firstname: new RegExp(search, "i") },
                    { lastname: new RegExp(search, "i") },
                    { mobileNumber: new RegExp(search, "i") },
                ],
            }
            : {};

        const sortCriteria =
            sort === "asc" ? { mobileNumber: 1 } : { mobileNumber: -1 };
        const data = await customersCollection.findOne(filter, { sort: sortCriteria });

        res.status(200).send({ success: true, data });
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
            return res
                .status(404)
                .send({ success: false, message: "Customer not found" });
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

        if (!updatedData || Object.keys(updatedData).length === 0) throw new Error("Please pass data");


        const customer = await customerModel.findByIdAndUpdate(
            customerId,
            updatedData,
            { new: true }
        );

        if (!customer) throw new Error("Customer not found");


        res.status(200).send({ success: true, data: customer });
    } catch (error) {
        handleError(res, error);
    }
};

const deleteCustomer = async ({ query }, res) => {
    try {
        const client = getConnection("connectUsingMongodb"); // DB connection method 4
        const db = client.db('customer-crud');
        const customersCollection = db.collection("customers");

        const { customerId } = query;
        if (!customerId || !Types.ObjectId.isValid(customerId)) throw new Error("Invalid customerId");


        const deletedCustomer = await customersCollection.findOneAndDelete({
            _id: new ObjectId(customerId),
        });
        if (!deletedCustomer) throw new Error("Invalid customerId");

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
    deleteCustomer,
};
