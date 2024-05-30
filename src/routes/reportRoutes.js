import express from 'express';
import { reportConroller } from '../controller/index.js';

const router = express.Router();

router.get('/saleReport', reportConroller.saleReport)



export default router;
