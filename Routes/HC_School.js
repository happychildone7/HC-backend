const express = require('express');
const {
    searchSchools,
    getSingleSchool,
    getAllSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    deleteMultipleSchool,
    activateSchools
} = require('../Controllers/HC_SchoolCtrl.js');

const router = express.Router();

router.get('/search/',searchSchools);
router.get('/:id',getSingleSchool);
router.get('/',getAllSchools);
router.post('/',createSchool);
router.patch('/:id',updateSchool);
router.delete('/:id',deleteSchool);
router.post('/deleteMany',deleteMultipleSchool);
router.post('/bulkActivate',activateSchools);

module.exports = router;