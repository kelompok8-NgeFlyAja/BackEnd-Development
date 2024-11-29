const express = require('express');
const router = express.Router();
const {createBooking, createPayment, midtransNotification} = require('../../controllers/user/paymentController');

router.post('/ticket-booking', createBooking);
router.post('/ticket-payment/:bookingId', createPayment);
router.post('/midtrans/notification', midtransNotification);

module.exports = router;