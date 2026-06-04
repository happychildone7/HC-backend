const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer.js');
const{
    fileUpload,
    cleanUp
} = require('../Controllers/HC_FileUploadCtrl.js');

router.post('/upload',upload.array('images',4),fileUpload);
router.post('/cleanUp',cleanUp);

module.exports = router;