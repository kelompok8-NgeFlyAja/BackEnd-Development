const express = require('express');
const router = express.Router();
const {createBooking, createSnapPayment, createCCPayment, createVAPayment ,midtransNotification, getTicketDetails} = require('../../controllers/user/paymentController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/ticket-details/:flightId', authMiddleware, getTicketDetails)
router.post('/ticket-booking', authMiddleware, createBooking);
router.post('/ticket-payment/:bookingId?', authMiddleware, createSnapPayment);

router.post('/payment-creditcard/:bookingId?', authMiddleware, createCCPayment);
router.post('/payment-va/:bookingId?/:bank?', authMiddleware, createVAPayment);

router.post('/midtrans/notification', midtransNotification);

module.exports = router;