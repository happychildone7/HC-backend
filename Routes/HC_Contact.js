const express = require('express');
const { protect } = require('../middlewares/authMiddleware.js');
const {
    searchContact,
    getSingleContact,
    getALlContacts,
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    activateContacts
} = require('../Controllers/HC_ContactCtrl.js');

const router = express.Router();

router.get('/search/', searchContact);
router.get('/:id', getSingleContact);
router.get('/', getALlContacts);
router.post('/', createContact);
router.patch('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/deleteMany', deleteMultipleContacts);
router.post('/bulkActivate',activateContacts);

module.exports = router;