import express from 'express';
import { customerController } from '../controller/index.js';

const router = express.Router();

router.post('/createCustomer', customerController.createCustomer);
router.get('/getAllCustomers', customerController.getAllCustomers);
router.get('/getCustomerById/', customerController.getCustomerById);
router.put('/updateCustomer/', customerController.updateCustomer);
router.delete('/deleteCustomer/', customerController.deleteCustomer);

export default router;
