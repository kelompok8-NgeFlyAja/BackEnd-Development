const router = require('express').Router();
const resetPasswordController = require('../../controllers/user/resetPasswordController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/verify-email', resetPasswordController.verifyEmail);
router.post('/reset-password/:token', resetPasswordController.resetPassword);
router.get('/verify-token/:token', resetPasswordController.verifyToken);

//update password
router.post('/update-password/:id', authMiddleware, resetPasswordController.updatePassword);

module.exports = router;