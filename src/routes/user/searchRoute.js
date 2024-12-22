const express = require('express');
const router = express.Router();
const search = require('../../controllers/user/search');

router.get('/search-flights', search.searchFlights);
router.get('/return-search-flights', search.returnSearchFlights);

module.exports = router;