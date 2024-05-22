import { Types } from 'mongoose';

const validateObjectId = (id, res) => {
    if (!id || !Types.ObjectId.isValid(id)) {
        res.status(400).send({ success: false, message: "Invalid customerId" });
        return false;
    }
    return true;
};

export default validateObjectId