const express = require('express');
const {
    searchCountries,
    fetchCountries,
    getSingleCountry,
    getAllCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    deactivateCountry
} = require('../Controllers/HC_CountryCtrl.js');

const router = express.Router();

router.get('/search/',searchCountries);
router.get('/fetch/',fetchCountries);
router.get('/:id',getSingleCountry);
router.get('/',getAllCountries);
router.post('/',createCountry);
router.patch('/:id',updateCountry);
router.delete('/:id',deleteCountry);
router.post('/deactivate',deactivateCountry);

module.exports = router;