const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/flightController');

router.get('/all-flight-details', controller.getAllFlight);
router.get('/flight-detail/:id', controller.getFlightDetail);
router.post('/add-flight', controller.addNewFlight);
router.delete('/delete-flight/:id', controller.deleteFlight);
router.patch('/update-flight/:id', controller.updateFlight);

module.exports = router;