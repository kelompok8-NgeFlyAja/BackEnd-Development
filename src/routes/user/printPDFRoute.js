const express = require("express");
const router = express.Router();
const printPDFController = require('../../controllers/user/printPDFController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/print-pdf/:bookingId', printPDFController.generatePDF);

module.exports = router;