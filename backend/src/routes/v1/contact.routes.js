const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contact.controller');

router.post('/', contactController.sendContactEmail);

router.get('/info', contactController.getContactInfo);

module.exports = router;
