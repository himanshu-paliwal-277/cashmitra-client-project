import express from 'express';
const router = express.Router();
import contactController from '../../controllers/contact.controller';

router.post('/', contactController.sendContactEmail);

router.get('/info', contactController.getContactInfo);

export default router;
