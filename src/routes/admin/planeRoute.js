const express = require("express");
const router = express.Router();
const {
	addNewPlane,
	getPlanes,
	getPlaneById,
	deletePlane,
	updatePlane,
} = require("../../controllers/admin/planeController");
const resetSeat = require("../../controllers/admin/resetSeatController");

router.post("/add-plane", addNewPlane);
router.get("/get-planes", getPlanes);
router.get("/get-plane/:id", getPlaneById);
router.delete("/delete-plane/:id", deletePlane);

router.get("/reset-plane-seat/:planeId", resetSeat);
// router.put('/update-plane/:id', updatePlane);

module.exports = router;
