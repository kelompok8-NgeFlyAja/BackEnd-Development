const express = require('express');
const router = express.Router();
const createSnapPayment = require('../../controllers/user/paymentSnapController');
const {createCCPayment,createVAPayment, midtransNotification} = require('../../controllers/user/paymentCoreController');
const {getTicketDetails, createBooking} = require('../../controllers/user/bookingController')
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/ticket-details/:flightId', authMiddleware, getTicketDetails)
router.post('/ticket-booking', authMiddleware, createBooking);

//This Is Snap
router.post('/ticket-payment/:bookingId?', authMiddleware, createSnapPayment);

//This is Core
router.post('/payment-creditcard/:bookingId?', authMiddleware, createCCPayment);
router.post('/payment-va/:bookingId?', authMiddleware, createVAPayment);
// router.post('/payment-va/:bookingId?/:bank?', authMiddleware, createVAPayment);

//This is the Callback
router.post('/midtrans/notification', midtransNotification);

module.exports = router;