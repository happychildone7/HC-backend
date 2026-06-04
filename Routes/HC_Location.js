const express = require('express');
const {
    searchLocations,
    getSingleLocation,
    getALlLocations,
    createLocation,
    deleteLocation,
    updateLocation,
    deleteMultipleHCLocation
} = require('../Controllers/HC_LocationCtrl.js');

const router = express.Router();

router.get('/search/',searchLocations);
router.get('/:id',getSingleLocation);
router.get('/',getALlLocations);
router.post('/',createLocation);
router.patch('/:id',updateLocation);
router.delete('/:id',deleteLocation);
router.post('/deleteMany',deleteMultipleHCLocation);

module.exports = router;