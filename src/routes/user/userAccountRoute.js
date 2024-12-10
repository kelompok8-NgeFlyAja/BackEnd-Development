const express = require("express");
const { ensureAuthenticated, updateUser } = require("../../controllers/user/userAccountController");
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.put("/update-user", authMiddleware, updateUser);

module.exports = router;