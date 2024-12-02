const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/featureFilter");

router.post("/get-filter", controller.getFilteredFlights);

module.exports = router;
