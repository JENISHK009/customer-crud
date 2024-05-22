const validateMobileNumber = (mobileNumber, res) => {
    const mobileNumberPattern = /^\d{10}$/;
    if (!mobileNumberPattern.test(mobileNumber)) {
        res.status(400).send({ success: false, message: "Invalid mobile number" });
        return false;
    }
    return true;
};

export default validateMobileNumber;