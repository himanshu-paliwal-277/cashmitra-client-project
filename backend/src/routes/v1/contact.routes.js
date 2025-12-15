import express from 'express';
const router = express.Router();
import * as contactController from '../../controllers/contact.controller.js';

router.post('/', contactController.sendContactEmail);

router.get('/info', contactController.getContactInfo);

export default router;
