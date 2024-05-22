const handleError = (res, error) => {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
};

export default handleError;