const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/airportController');
const authMiddleware = require("../../middlewares/authMiddleware");

router.post('/add-airports', authMiddleware(['admin']), controller.addMultipleAirports);
router.post('/add-airport', authMiddleware(['admin']), controller.addNewAirport);
router.delete('/delete-airport/:id', authMiddleware(['admin']), controller.deleteAirport);
router.get('/get-airports', controller.getAllAirports);

module.exports = router;