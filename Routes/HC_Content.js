const express = require('express');
const {
    getSingleHCContent,
    getALlHCContent,
    createHCContent,
    deleteHCContent,
    deleteMultipleHCContent,
    deleteByRelatedIds,
    updateHCContent
} = require('../Controllers/HC_ContentCtrl.js');

const router = express.Router();

router.get('/:id',getSingleHCContent);
router.get('/',getALlHCContent);
router.post('/',createHCContent);
router.delete('/:id',deleteHCContent);
router.post('/deleteMany',deleteMultipleHCContent);
router.post('/deleteByRelated',deleteByRelatedIds);
router.patch('/:id',updateHCContent);

module.exports = router;