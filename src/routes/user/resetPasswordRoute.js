const router = require('express').Router();
const resetPasswordController = require('../../controllers/user/resetPasswordController');

router.post('/verify-email', resetPasswordController.verifyEmail);
router.post('/reset-password/:token', resetPasswordController.resetPassword);
router.get('/verify-token/:token', resetPasswordController.verifyToken);

module.exports = router;