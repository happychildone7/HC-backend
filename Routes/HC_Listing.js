const express = require('express');
const {
    fetchPartnerListings
} = require('../Controllers/HC_ListingCtrl.js');

const router = express.Router();

router.get('/:ownerId',fetchPartnerListings);

module.exports = router;