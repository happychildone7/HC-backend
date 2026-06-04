const express = require('express');
const {
    registerUser,
    verifyUser,
} = require('../Controllers/HC_SignupCtrl.js');

const router = express.Router();

router.post('/register',registerUser);
router.post('/verifyUser',verifyUser);

module.exports = router;