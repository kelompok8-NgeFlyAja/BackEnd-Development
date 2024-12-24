const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/classController');
const authMiddleware = require("../../middlewares/authMiddleware");

router.post('/add-classes', authMiddleware(['admin']), controller.addNewClass);
router.get('/get-classes', controller.getAllClasses);
router.get('/get-class/:id', controller.getUniqueClass);
router.put('/update-class/:id', authMiddleware(['admin']), controller.updateClass);
router.delete('/delete-class/:id', authMiddleware(['admin']), controller.deleteClass);

module.exports = router;