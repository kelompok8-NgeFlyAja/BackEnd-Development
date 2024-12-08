const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/featureFilter");

router.get("/filter-flight", controller.getFilteredFlights);
router.get('/filter-baggage', controller.getFilteredBaggage);
router.get('/filter-cabin-baggage', controller.getFilteredCabinBaggage);
router.get('/filter-desc', controller.getFilteredDesc);

module.exports = router;
