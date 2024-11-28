const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/flightRouteController");

router.post("/routes", controller.addNewRoute);
router.get("/routes", controller.getAllRoute);
router.get("/routes/:id", controller.getUniqueRoute);
router.put("/routes/:id", controller.updateRoute);
router.delete("/routes/:id", controller.deleteRoute);

module.exports = router;
