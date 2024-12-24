const express = require("express");
const router = express.Router();
const {
	addNewPlane,
	getPlanes,
	getPlaneById,
	deletePlane,
	updatePlane,
} = require("../../controllers/admin/planeController");
const authMiddleware = require("../../middlewares/authMiddleware");

router.post("/add-plane", authMiddleware(['admin']), addNewPlane);
router.get("/get-planes", getPlanes);
router.get("/get-plane/:id", getPlaneById);
router.delete("/delete-plane/:id", authMiddleware(['admin']), deletePlane);

// router.put('/update-plane/:id', updatePlane);

module.exports = router;
