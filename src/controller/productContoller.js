import { productModel } from '../models/index.js';
import { handleError } from '../utils/index.js';

const addProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        if (!name || !price || !description || !category || !stock) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        const newProduct = new productModel({
            name,
            price,
            description,
            category,
            stock
        });

        const savedProduct = await newProduct.save();
        res.status(200).send({ success: true, message: "Product created successfully", data: savedProduct });
    } catch (error) {
        handleError(res, error);
    }
};

export default {
    addProduct,
};
