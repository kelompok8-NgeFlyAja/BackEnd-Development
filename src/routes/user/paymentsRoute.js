const express = require('express');
const router = express.Router();
const {createBooking, createSnapPayment, createCCPayment, midtransNotification, getTicketDetails} = require('../../controllers/user/paymentController');

router.get('/ticket-details/:flightId', getTicketDetails)
router.post('/ticket-booking', createBooking);
router.post('/ticket-payment/:bookingId?', createSnapPayment);

router.post('/payment-creditcard/:bookingId?', createCCPayment);

router.post('/midtrans/notification', midtransNotification);

module.exports = router;