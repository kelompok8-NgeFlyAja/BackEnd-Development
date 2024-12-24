const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/flightController');
const authMiddleware = require("../../middlewares/authMiddleware");

router.get('/all-flight-details', controller.getAllFlight);
router.get('/flight-detail/:id', controller.getFlightDetail);
router.post('/add-flight', authMiddleware(['admin']), controller.addNewFlight);
router.delete('/delete-flight/:id', authMiddleware(['admin']), controller.deleteFlight);
router.patch('/update-flight/:id', authMiddleware(['admin']), controller.updateFlight);

module.exports = router;