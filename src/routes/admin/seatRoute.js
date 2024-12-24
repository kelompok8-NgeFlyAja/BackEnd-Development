const express = require("express");
const router = express.Router();
const {resetSeat, getSeat, getSeatById} = require("../../controllers/admin/SeatController");
const authMiddleware = require("../../middlewares/authMiddleware");

router.get("/plane-seat", getSeat)
router.get("/plane-seat/:id", getSeatById)
router.get("/reset-plane-seat/:planeId", authMiddleware(['admin']), resetSeat);

module.exports = router