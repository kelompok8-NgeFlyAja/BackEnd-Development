const express = require('express');
const router = express.Router();
const {getNotification, readNotificationById} = require('../../controllers/user/notificationController')
const authMiddleware = require('../../middlewares/authMiddleware');

router.get('/notifications', authMiddleware, getNotification)
router.put('/notifications/:notificationId', authMiddleware, readNotificationById)

module.exports = router

