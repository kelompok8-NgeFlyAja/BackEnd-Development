const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/flightRouteController");
const authMiddleware = require("../../middlewares/authMiddleware");

router.post("/routes", authMiddleware(['admin']), controller.addNewRoute);
router.get("/routes", controller.getAllRoute);
router.get("/routes/:id", controller.getUniqueRoute);
router.put("/routes/:id", authMiddleware(['admin']), controller.updateRoute);
router.delete("/routes/:id", authMiddleware(['admin']), controller.deleteRoute);

module.exports = router;
