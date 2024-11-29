const express = require('express');
const router = express.Router();
const {createBooking, createPayment, midtransNotification, getTicketDetails} = require('../../controllers/user/paymentController');

router.get('/ticket-details/:flightId', getTicketDetails)
router.post('/ticket-booking', createBooking);
router.post('/ticket-payment/:bookingId', createPayment);
router.post('/midtrans/notification', midtransNotification);

module.exports = router;