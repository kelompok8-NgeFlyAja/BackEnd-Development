const express = require("express");
const router = express.Router();
const {resetSeat, getSeat, getSeatById} = require("../../controllers/admin/SeatController");

router.get("/plane-seat", getSeat)
router.get("/plane-seat/:id", getSeatById)
router.get("/reset-plane-seat/:planeId", resetSeat);

module.exports = router