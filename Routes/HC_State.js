const express = require('express');
const {
    searchStates,
    fetchStates,
    getSingleState,
    getAllStates,
    createState,
    bulkCreateState,
    updateState,
    deleteState,
    deactivateState
} = require('../Controllers/HC_StateCtrl.js');

const router = express.Router();

router.get('/search/',searchStates);
router.get('/fetch/',fetchStates);
router.get('/:id',getSingleState);
router.get('/',getAllStates);
router.post('/',createState);
router.post('/bulk-create-state',bulkCreateState);
router.patch('/:id',updateState);
router.delete('/:id',deleteState);
router.post('/deactivate',deactivateState);

module.exports = router;