const express = require('express');
const {
    searchRegistrations,
    getSingleRegistration,
    getAllRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    deleteMultipleRegistration,
    activateRegistrations
} = require('../Controllers/HC_RegistrationCtrl.js');

const router = express.Router();

router.get('/search/',searchRegistrations);
router.get('/:id',getSingleRegistration);
router.get('/',getAllRegistrations);
router.post('/',createRegistration);
router.patch('/:id',updateRegistration);
router.delete('/:id',deleteRegistration);
router.post('/deleteMany',deleteMultipleRegistration);
router.post('/bulkActivate',activateRegistrations);

module.exports = router;