const express = require('express');
const router = express.Router();
const { addNewPlane, getPlanes, getPlaneById, deletePlane, updatePlane } = require('../../controllers/admin/planeController');

router.post('/add-plane', addNewPlane);
router.get('/get-planes', getPlanes);
router.get('/get-plane/:id', getPlaneById);
router.delete('/delete-plane/:id', deletePlane);
// router.put('/update-plane/:id', updatePlane);


module.exports = router;