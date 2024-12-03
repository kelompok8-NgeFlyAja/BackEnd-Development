const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/featureFilter");

router.get("/filter-flight", controller.getFilteredFlights);

module.exports = router;
