import { ObjectId } from "mongodb";
import _ from "lodash";
import __ from "underscore";
import { customerModel } from "../models/index.js";
import { getConnection } from "../config/index.js";
import {
    validateObjectId,
    handleError,
    validateMobileNumber,
    firebaseDb,
} from "../utils/index.js";

const createCustomer = async (req, res) => {
    const client = getConnection("connectUsingMongodb");
    const session = client.startSession();
    let transactionCommitted = false;

    try {
        session.startTransaction();

        const db = client.db("customer-crud");
        const customersCollection = db.collection("customers");

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
            return res.status(400).send({
                success: false,
                message: `${validationErrors.join(", ")} is required`,
            });
        }

        const invalidMobileNumbers = customersData.filter(
            (customer) => !validateMobileNumber(customer.mobileNumber, res)
        );
        if (invalidMobileNumbers.length > 0) return;

        const result = await customersCollection.insertMany(customersData, { session });

        const plainCustomers = customersData.map((customer, index) => ({
            ...customer,
            _id: result.insertedIds[index].toString(),
        }));


        const batch = firebaseDb.batch();
        plainCustomers.forEach((customer) => {
            const customerRef = firebaseDb.collection("customers").doc(customer._id);
            batch.set(customerRef, customer);
        });
        await batch.commit();

        await session.commitTransaction();
        transactionCommitted = true;

        res.status(200).send({
            success: true,
            message: "Customers created successfully",
            data: plainCustomers,
        });
    } catch (error) {
        if (!transactionCommitted) {
            await session.abortTransaction();
        }
        handleError(res, error);
    } finally {
        session.endSession();
    }
};

const getAllCustomers = async ({ query }, res) => {
    try {
        const client = getConnection("connectUsingMongodb");
        const db = client.db("customer-crud");
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
        const data = await customersCollection.findOne(filter, {
            sort: sortCriteria,
        });

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

const updateCustomer = async (req, res) => {
    const client = getConnection("connectUsingMongodb");
    const session = client.startSession();
    try {
        const { customerId, updatedData } = req.body;

        if (!validateObjectId(customerId, res)) return;

        if (!updatedData || Object.keys(updatedData).length === 0) {
            throw new Error("Please pass data");
        }

        session.startTransaction();

        const db = client.db("customer-crud");
        const customersCollection = db.collection("customers");

        const customerObjectId = new ObjectId(customerId);

        const existingCustomer = await customersCollection.findOne({ _id: customerObjectId });
        if (!existingCustomer) {
            console.error("Customer with ID", customerObjectId, "does not exist in MongoDB.");
            throw new Error("Customer not found");
        }

        const customer = await customersCollection.findOneAndUpdate(
            { _id: customerObjectId },
            { $set: updatedData },
            { returnDocument: "after", session }
        );

        if (!customer) {
            throw new Error("Customer not found");
        }

        const customerIdString = customer._id.toString();
        const customerRef = firebaseDb.collection("customers").doc(customerIdString);
        await customerRef.update(updatedData);

        await session.commitTransaction();
        session.endSession();

        res.status(200).send({ success: true, data: customer });
    } catch (error) {
        await session.abortTransaction();
        handleError(res, error);
    } finally {
        session.endSession();
    }
};



const deleteCustomer = async ({ query }, res) => {
    try {
        const client = getConnection("connectUsingMongodb"); // DB connection method 4
        const db = client.db("customer-crud");
        const customersCollection = db.collection("customers");

        const { customerId } = query;
        if (!customerId || !Types.ObjectId.isValid(customerId))
            throw new Error("Invalid customerId");

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
