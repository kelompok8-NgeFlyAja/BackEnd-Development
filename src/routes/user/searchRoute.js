const express = require('express');
const router = express.Router();
const search = require('../../controllers/user/search');

router.get('/flights', search.searchFlights);

module.exports = router;