import express from 'express';
import { userController } from '../controller/index.js';

const router = express.Router();

router.get('/reportForReferal', userController.reportForReferal);

export default router;
