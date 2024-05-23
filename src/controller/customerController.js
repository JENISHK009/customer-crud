import { ObjectId } from 'mongodb';
import _ from 'lodash';
import __ from 'underscore';
import { customerModel } from '../models/index.js';
import { getConnection } from '../config/index.js'
import { validateObjectId, handleError, validateMobileNumber, sortingMethod3, sortingMethod4 } from '../utils/index.js'


const createCustomer = async (req, res) => {
    try {
        const customersData = req.body;

        if (!Array.isArray(customersData) || customersData.length === 0) {
            return res.status(400).send({ success: false, message: "Customer data must be provided as an array" });
        }

        const validationErrors = customersData.reduce((errors, customer, index) => {
            if (!customer.firstname) errors.push(`Customer ${index + 1}: firstname`);
            if (!customer.lastname) errors.push(`Customer ${index + 1}: lastname`);
            if (!customer.mobileNumber) errors.push(`Customer ${index + 1}: mobileNumber`);
            return errors;
        }, []);

        if (validationErrors.length > 0) {
            return res.status(400).send({ success: false, message: `${validationErrors.join(", ")} is required` });
        }

        const invalidMobileNumbers = customersData.filter(customer => !validateMobileNumber(customer.mobileNumber, res));
        if (invalidMobileNumbers.length > 0) return;

        const savedCustomers = await customerModel.insertMany(customersData);

        res.status(200).send({ success: true, message: "Customers created successfully", data: savedCustomers });
    } catch (error) {
        handleError(res, error);
    }
};

const getAllCustomers = async ({ query }, res) => {
    try {
        const db = getConnection('createDatabaseConnection');
        const CustomerModel = db.model('Customer', customerModel.schema);

        const { search, sort } = query;
        const filter = search ? { $or: [{ firstname: new RegExp(search, 'i') }, { lastname: new RegExp(search, 'i') }, { mobileNumber: new RegExp(search, 'i') }] } : {};

        let getDataTime1 = performance.now();
        let customersWithoutSort = await CustomerModel.find(filter);
        let getDataTime2 = performance.now();
        const databaseTime = getDataTime2 - getDataTime1;

        // sort using method 1 - using mongoose sort method  - Fastest 
        const sortCriteria = sort === 'asc' ? { mobileNumber: 1 } : { mobileNumber: -1 };
        const startTime1 = performance.now();
        const method1 = await CustomerModel.find(filter).sort(sortCriteria);
        const endTime1 = performance.now();
        const timeTaken1 = endTime1 - startTime1;

        const startTime2 = performance.now();
        // sort using method 2 - using slice sort
        const method2 = customersWithoutSort.slice().sort((a, b) => a.mobileNumber.localeCompare(b.mobileNumber));
        const endTime2 = performance.now();
        const timeTaken2 = (endTime2 - startTime2) + databaseTime;

        const startTime3 = performance.now();
        // sort using method 3 - using 2 for loops
        const method3 = sortingMethod3(customersWithoutSort);
        const endTime3 = performance.now();
        const timeTaken3 = (endTime3 - startTime3) + databaseTime;

        const startTime4 = performance.now();
        // sort using method 4 - using for loops and if
        const method4 = sortingMethod4(customersWithoutSort);
        const endTime4 = performance.now();
        const timeTaken4 = (endTime4 - startTime4) + databaseTime;

        const startTime5 = performance.now();
        // sort using method 5 - using lodash npm
        const method5 = _.sortBy(customersWithoutSort, 'mobileNumber');
        const endTime5 = performance.now();
        const timeTaken5 = (endTime5 - startTime5) + databaseTime;

        const startTime6 = performance.now();
        // sort using method 6 - using underscore npm
        const method6 = __.sortBy(customersWithoutSort, 'mobileNumber');
        const endTime6 = performance.now();
        const timeTaken6 = (endTime6 - startTime6) + databaseTime;

        res.status(200).send({ success: true, method1, method2, method3, method4, method5, method6, timeTaken1, timeTaken2, timeTaken3, timeTaken4, timeTaken5, timeTaken6 });
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
    deleteCustomer,
};
