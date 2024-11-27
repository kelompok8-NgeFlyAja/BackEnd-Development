const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/airportController');

router.post('/add-airports', controller.addMultipleAirports);
router.post('/add-airport', controller.addNewAirport);
router.delete('/delete-airport/:id', controller.deleteAirport);
router.get('/get-airports', controller.getAllAirports);

module.exports = router;