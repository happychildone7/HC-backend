const express = require('express');
const {
    trackMetric
} = require('../Controllers/HC_AnalyticsCtrl.js');

const router = express.Router();

router.post('/track',trackMetric);

module.exports = router;