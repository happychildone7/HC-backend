const express = require('express');
const {
    searchUsers,
    fetchUsers,
    getUserByContactId,
    getSingleUser,
    getALlUsers,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser
} = require('../Controllers/HC_UserCtrl.js');

const router = express.Router();

router.get('/search/',searchUsers);
router.get('/fetch',fetchUsers);
router.get('/contact/:contactId',getUserByContactId);
router.get('/:id',getSingleUser);
router.get('/',getALlUsers);
router.post('/',createUser);
router.patch('/:id',updateUser);
router.delete('/:id',deleteUser);
router.post('/deactivateUser',deactivateUser);

module.exports = router;