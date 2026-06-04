const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const {
    fetchSchoolContent,
    fetchFeaturedSchoolContent
} = require('../Controllers/HC_SchoolContentCtrl.js');

const router = express.Router();

router.get('/fetch/', protect, fetchSchoolContent);
router.get('/fetchFeatured', protect, fetchFeaturedSchoolContent)

module.exports = router;