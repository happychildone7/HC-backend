const express = require('express');
const {
    fetchPartnerListings,
    getListingDetail
} = require('../Controllers/HC_ListingCtrl.js');

const router = express.Router();

router.get('/:ownerId',fetchPartnerListings);
router.get('/promotion/:listingType/:listingId',getListingDetail);

module.exports = router;