import express from 'express';
import { productContoller } from '../controller/index.js';

const router = express.Router();

router.post('/addProduct', productContoller.addProduct)



export default router;
