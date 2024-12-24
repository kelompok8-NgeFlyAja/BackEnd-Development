const express = require('express');
const router = express.Router();
const createSnapPayment = require('../../controllers/user/paymentSnapController');
const getTransactionHistory = require('../../controllers/user/transactionHistory.js')

const {createCCPayment,createPayment, midtransNotification, checkPaymentVa} = require('../../controllers/user/paymentCoreController');
const {getTicketDetails, createBooking,  getBookingById} = require('../../controllers/user/bookingController')

const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/booking/:bookingId?', authMiddleware(), getBookingById)
router.get('/ticket-details', getTicketDetails)
router.get('/transaction-history', authMiddleware(), getTransactionHistory)
router.post('/ticket-booking', authMiddleware(), createBooking);
//This Is Snap
router.post('/ticket-payment/:bookingId?', authMiddleware(), createSnapPayment);
//This is Core
router.post('/payment-creditcard/:bookingId?', authMiddleware(), createCCPayment);
router.post('/payment/:bookingId?', authMiddleware(), createPayment);
//This is the Callback
router.post('/midtrans/notification', midtransNotification);
router.get('/check-payment/:bookingId?', authMiddleware(), checkPaymentVa);

module.exports = router;
