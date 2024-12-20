const express = require("express");
const {updateUser, getUser} = require("../../controllers/user/userAccountController");
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.put("/update-user", authMiddleware, updateUser);
router.get("/user", authMiddleware, getUser);

module.exports = router;
