const mongoose = require('mongoose');
const School = require('../Models/School.js');
const Location = require('../Models/Location.js');
const Event = require('../Models/Event.js');
const User = require('../Models/User.js');
const Contact = require('../Models/Contact.js');
const HCContent = require('../Models/Content.js');
const { deleteCloudinaryImages } = require('../utils/cloudinaryHelper.js');

//Search Event
const searchEvents = async (req,res) => {
    const { query } = req.query;
    try {
        const matches = await Event.find({
            Name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
        return res.status(200).json(matches);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
};

//get single Event
const getSingleEvent = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Event'});
    }
    const event = await Event.findById(id).populate('school__c').populate('location__c').populate('primary_Contact__c').lean();
    if(!event){
        return res.status(400).json({error: 'No such Event'});
    }
    const contents = await HCContent.find({ related_To_Id__c:  id, type__c: 'Image', related_Type__c: 'HC_Event'}).lean();
    const images = contents.map(content => ({
        id: content._id,
        publicId: content.public_Id__c,
        url: content.image_URL__c,
        previewUrl: content.image_URL__c,
        primary: content.primary_Image__c,
        title: content.title__c
    }));
    const eventWithImages = {
        ...event,
        images
    };
    res.status(200).json(eventWithImages);
}

//get all Events
const getAllEvents = async (req,res) => {
    const events = await Event.find({}).populate('school__c').populate('location__c').populate('primary_Contact__c');
    return res.status(200).json(events);
}

//create a Event
const createEvent = async (req,res) => {
    console.log('check>><>',req.body);
    req.body.primary_Contact__c = req.body.primary_Contact__c || null;
    req.body.status = req.body.status || 'Draft';
    req.body.registered_Count__c = req.body.registered_Count__c || 0;
    req.body.active__c = req.body.active__c || false;

    const { 
            Name__c,
            desciption__c,
            event_Type__c,
            event_Date__c,
            event_Start_Time__c,
            event_End_Time__c,
            duration_Hours__c,
            fee_Range__c,
            age_Group__c,
            format__c,
            amenities__c,
            school__c,
            location__c,
            capacity__c,
            registered_Count__c,
            active__c,
            status__c,
            owner__c,
            primary_Contact__c 
        } = req.body;
    
    if(!owner__c) {
      return res.status(400).json({ error: 'Owner is required.' });
    }
    const ownerExists = await User.findById(owner__c);
    if (!ownerExists) {
        console.log('no user');
        return res.status(400).json({ error: 'Invalid Owner selected.' });
    }
    if(primary_Contact__c){
        const contExists = await Contact.findById(primary_Contact__c);
        if (!contExists) {
            return res.status(400).json({ error: 'Invalid contact selected.' });
        }
        console.log('no contact');
    }
    if(school__c){
        const schoolExists = await School.findById(school__c);
        if (!schoolExists) {
            return res.status(400).json({ error: 'Invalid school selected.' });
        }
        console.log('no school');
    }
    if(location__c){
        const locationExists = await Location.findById(location__c);
        if (!locationExists) {
            return res.status(400).json({ error: 'Invalid location selected.' });
        }
        console.log('no loc');
    }
    try{
        const event = await Event.create({ 
                                            Name__c,desciption__c,event_Type__c,event_Date__c,event_Start_Time__c,event_End_Time__c,duration_Hours__c,fee_Range__c,
                                            age_Group__c,format__c,amenities__c,school__c,location__c,capacity__c,registered_Count__c,
                                            active__c,status__c,primary_Contact__c,owner__c
                                        });
        return res.status(200).json(event);
    }
    catch(error){
        console.log('some error',error);
        return res.status(400).json({error: error.message})
    }
}

//update a Event
const updateEvent = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Event'});
    }
    try{
        const event = await Event.findOneAndUpdate(
            { _id: id }, 
            { $set: req.body },  
            { 
                new: true,          
                runValidators: true  
            }
        );
        if(!event){
            return res.status(400).json({error: 'No such Event'});
        }
        const populatedEvent = await Event.findById(id)
            .populate('school__c')
            .populate('location__c')
            .populate('owner__c')
            .lean();
        return res.status(200).json(populatedEvent);
    }catch(error){
        console.error('Update Event error:', error);
        res.status(500).json({ error: 'Server error updating Event' });
    }
}

//delete a Event
const deleteEvent = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Event'});
    }
    const deleteStats = await deleteContentAndCloudinaryImages([id]);
    const eventRec = await Event.findById({ _id: id });
    const locationDelete = await Location.deleteOne({ _id:  eventRec.location__c});
    const result = await Event.deleteOne({_id: id});
    if(result.deletedCount === 0){
        return res.status(400).json({error: 'No such Event'});
    }
    return res.status(200).json({
        message: 'Event deleted successfully.',
        deletedEvent: 1,
        deletedLocation: 1,
        deletedContents: deleteStats.deletedContents,
        deletedImages: deleteStats.deletedImages
    });
};

//delete multiple HC Event
const deleteMultipleEvent = async (req, res) => {
    try{
        const { ids } = req.body;
        console.log('IDS>',ids);
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: 'Expected an array of IDs.' });
        }
        // Validate all IDs
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid IDs: ${invalidIds.join(', ')}` });
        }
        const deleteStats = await deleteContentAndCloudinaryImages(ids);
        const result = await Event.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} Event(s) deleted.`,
          deletedEvents: result.deletedCount,
          deletedContents: deleteStats.deletedContents || 0,
          deletedImages: deleteStats.deletedImages || 0
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const activateEvents = async (req,res) => {
    const { ids } = req.body;
    
    if(!Array.isArray(ids) || ids.length === 0){
        return res.status(400).json({ error: 'No IDS provided.'});
    }
    if(!ids.every(id => mongoose.Types.ObjectId.isValid(id))){
        return res.status(400).json({ error: 'Invalid ids.' });
    }
    const result = await Event.updateMany(
        { _id: { $in: ids }, active__c: false },
        { $set: { active__c: true } }
    );
    return res.status(200).json({
        updated: result.modifiedCount,
        matched: result.matchedCount
    });
};
const deleteContentAndCloudinaryImages = async (eventIds) => {
    if(!Array.isArray(eventIds)){
        eventIds = [eventIds];
    }
    const contents = await HCContent.find({ related_To_Id__c: { $in: eventIds } });
    const imgPublicIds = contents.map(content => content.public_Id__c).filter(Boolean);
    let deletedImages = 0;
    if(imgPublicIds.length > 0){
        const cleanupResult = await deleteCloudinaryImages(imgPublicIds);
        deletedImages = cleanupResult.deleted || 0;
    }

    const contentDeletedResult = await HCContent.deleteMany({ related_To_Id__c: { $in: eventIds } });
    return {
        deletedContents: contentDeletedResult.deletedCount,
        deletedImages
    };
};

module.exports = {
    searchEvents,
    getSingleEvent,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    deleteMultipleEvent,
    activateEvents
}