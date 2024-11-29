const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/classController');

router.post('/add-classes', controller.addNewClass);
router.get('/get-classes', controller.getAllClasses);
router.get('/get-class/:id', controller.getUniqueClass);
router.put('/update-class/:id', controller.updateClass);
router.delete('/delete-class/:id', controller.deleteClass);

module.exports = router;