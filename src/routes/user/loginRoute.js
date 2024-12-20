const express = require("express");
const router = express.Router();
const login = require("../../controllers/user/login");

router.post("/login", login); 

module.exports = router;
