const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const {
    fetchEventContent,
    fetchFeaturedEventContent
} = require('../Controllers/HC_EventContentCtrl.js');

const router = express.Router();

router.get('/fetch/', protect, fetchEventContent);
router.get('/fetchFeatured', protect, fetchFeaturedEventContent)

module.exports = router;