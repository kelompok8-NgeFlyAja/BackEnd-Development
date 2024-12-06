const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/user/register");

router.post("/register", controllers.newRegister);
router.get("/verify-otp", controllers.verifyOtp);
router.post("/resend-otp", controllers.resendOtp);

module.exports = router;
