const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/flightController');

router.get('/all-flight-details', controller.getAllFlight);
router.get('/flight-detail/:id', controller.getFlightDetail);

module.exports = router;