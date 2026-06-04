const express = require('express');
const {
    searchEvents,
    getSingleEvent,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    deleteMultipleEvent,
    activateEvents
} = require('../Controllers/HC_EventCtrl.js');

const router = express.Router();

router.get('/search/',searchEvents);
router.get('/:id',getSingleEvent);
router.get('/',getAllEvents);
router.post('/',createEvent);
router.patch('/:id',updateEvent);
router.delete('/:id',deleteEvent);
router.post('/deleteMany',deleteMultipleEvent);
router.post('/bulkActivate',activateEvents);

module.exports = router;