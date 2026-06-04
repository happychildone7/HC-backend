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

router.get('/search/', protect, searchContact);
router.get('/:id', protect, getSingleContact);
router.get('/', protect, getALlContacts);
router.post('/', protect, createContact);
router.patch('/:id', protect, updateContact);
router.delete('/:id', protect, deleteContact);
router.post('/deleteMany', protect, deleteMultipleContacts);
router.post('/bulkActivate',activateContacts);

module.exports = router;