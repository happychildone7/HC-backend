const express = require('express');
const {
    searchCities,
    fetchCities,
    getSingleCity,
    getAllCities,
    createCity,
    bulkCreateCity,
    updateCity,
    deleteCity,
    deactivateCity
} = require('../Controllers/HC_CityCtrl.js');

const router = express.Router();

router.get('/search/',searchCities);
router.get('/fetch/',fetchCities);
router.get('/:id',getSingleCity);
router.get('/',getAllCities);
router.post('/',createCity);
router.post('/bulk-create-City',bulkCreateCity);
router.patch('/:id',updateCity);
router.delete('/:id',deleteCity);
router.post('/deactivate',deactivateCity);

module.exports = router;