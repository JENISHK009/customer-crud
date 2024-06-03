import express from 'express';
import { eventContoller } from '../controller/index.js';

const router = express.Router();

router
    .post('/createEvent', eventContoller.createEvent)
    .get('/getAllEvents', eventContoller.getAllEvents)
    .put('/updateEvent', eventContoller.updateEvent)



export default router;
