const express = require('express');
const router = express.Router();
const createSnapPayment = require('../../controllers/user/paymentSnapController');
const getTransactionHistory = require('../../controllers/user/transactionHistory.js')
const {createCCPayment,createPayment, midtransNotification} = require('../../controllers/user/paymentCoreController');
const {getTicketDetails, createBooking} = require('../../controllers/user/bookingController')
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/ticket-details/:flightId', authMiddleware, getTicketDetails)
router.get('/transaction-history', authMiddleware, getTransactionHistory)
router.post('/ticket-booking', authMiddleware, createBooking);

//This Is Snap
router.post('/ticket-payment/:bookingId?', authMiddleware, createSnapPayment);

//This is Core
router.post('/payment-creditcard/:bookingId?', authMiddleware, createCCPayment);
router.post('/payment/:bookingId?', authMiddleware, createPayment);

//This is the Callback
router.post('/midtrans/notification', midtransNotification);

module.exports = router;
