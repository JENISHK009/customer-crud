import { orderModel, paymentModel } from '../models/index.js';
import { validateObjectId, handleError } from '../utils/index.js'

const addPayment = async (req, res) => {
    try {
        const { orderId, amount, paymentMethod, status } = req.body;

        if (!orderId || !amount || !paymentMethod || !status) {
            return res.status(400).send({ success: false, message: "All fields are required" });
        }

        if (!validateObjectId(orderId, res)) return;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).send({ success: false, message: "Order not found" });
        }

        const newPayment = new paymentModel({
            orderId,
            amount,
            paymentMethod,
            status
        });

        const savedPayment = await newPayment.save();
        res.status(200).send({ success: true, message: "Payment created successfully", data: savedPayment });
    } catch (error) {
        handleError(res, error);
    }
};

export default {
    addPayment,
};