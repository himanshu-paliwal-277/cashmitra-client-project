import express from 'express';

import { checkDeliveryTime } from '../../controllers/delivery.controller.js';

const router = express.Router();

router.post('/estimate-time', checkDeliveryTime);

export default router;
