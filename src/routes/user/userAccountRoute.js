const express = require("express");
const { ensureAuthenticated, updateUser } = require("../../controllers/user/userAccountController");
const router = express.Router();

router.put("/update-user", ensureAuthenticated, updateUser);

module.exports = router;