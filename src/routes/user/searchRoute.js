const express = require('express');
const router = express.Router();
const search = require('../../controllers/user/search');

router.get('/search-flights', search.searchFlights);

module.exports = router;