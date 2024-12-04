const express = require("express");
const router = express.Router();
const flightController = require("../../controllers/user/flightController");

router.get("/favorite-destination", flightController.getFlightCard);

module.exports = router;
