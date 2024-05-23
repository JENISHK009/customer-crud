import express from 'express';
import { paymentContoller } from '../controller/index.js';

const router = express.Router();

router.post('/addPayment', paymentContoller.addPayment)



export default router;
