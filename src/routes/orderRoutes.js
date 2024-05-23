import express from 'express';
import { orderContoller } from '../controller/index.js';

const router = express.Router();

router.get('/getOrderDetails', orderContoller.getOrderDetails)
    .post('/addOrder', orderContoller.addOrder);


export default router;
