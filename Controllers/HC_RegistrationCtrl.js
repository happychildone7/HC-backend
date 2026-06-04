const mongoose = require('mongoose');
const Contact = require('../Models/Contact.js');
const Event = require('../Models/Event.js');
const Registration = require('../Models/Registration.js');

//Search Registration
const searchRegistrations = async (req,res) => {
    const { query } = req.query;
    try {
        const matches = await Registration.find({
            registration_Number__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
        return res.status(200).json(matches);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
};

//get single Registration
const getSingleRegistration = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Registration'});
    }
    const registration = await Registration.findById(id).populate('event__c').populate('contact__c').lean();
    if(!registration){
        return res.status(400).json({error: 'No such Registration'});
    }
    res.status(200).json(registration);
}

//get all Registrations
const getAllRegistrations = async (req,res) => {
    const registrations = await Registration.find({}).populate('event__c').populate('contact__c');
    return res.status(200).json(registrations);
}

//create a Registration
const createRegistration = async (req,res) => {
    console.log('check>><>',req.body);
    req.body.contact__c = req.body.contact__c || null;
    req.body.event__c = req.body.event__c || null;
    req.body.status__c = req.body.status__c || 'Registered';
    req.body.seat_Count__c = req.body.seat_Count__c || 1;
    req.body.attendance_Status__c = req.body.attendance_Status__c || 'Not_Checked_In';
    req.body.payment_Status__c = req.body.payment_Status__c || 'Not_Required';

    const { 
            contact__c,
            event__c,
            status__c,
            attendance_Status__c,
            payment_Status__c,
            seat_Count__c,
            notes__c
        } = req.body;

    if(!contact__c) {
      return res.status(400).json({ error: 'Contact is required.' });
    }

    if(!event__c) {
      return res.status(400).json({ error: 'Event is required.' });
    }

    
    if(contact__c){
        const contExists = await Contact.findById(contact__c);
        if (!contExists) {
            console.log('no contact');
            return res.status(400).json({ error: 'Invalid contact selected.' });
        }
    }
    if(event__c){
        const eventExists = await Event.findById(event__c);
        if (!eventExists) {
            console.log('no event');
            return res.status(400).json({ error: 'Invalid event selected.' });
        }
    }
    const duplicateExists = await Registration.findOne({ contact__c, event__c });
    if(duplicateExists){
        return res.status(400).json({ error: 'This contact is already registered for this event.' });
    }

    try{
        const registration = await Registration.create({ 
                                            contact__c,event__c,status__c,attendance_Status__c,payment_Status__c,
                                            seat_Count__c,notes__c
                                        });
        return res.status(200).json(registration);
    }
    catch(error){
        console.log('some error',error);
        return res.status(400).json({error: error.message})
    }
}

//update a Registration
const updateRegistration = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Registration'});
    }
    try{
        const registration = await Registration.findOneAndUpdate(
            { _id: id }, 
            { $set: req.body },  
            { 
                new: true,          
                runValidators: true  
            }
        );
        if(!registration){
            return res.status(400).json({error: 'No such Registration'});
        }
        const populatedRegistration = await Registration.findById(id)
            .populate('contact__c')
            .populate('event__c')
            .lean();
        return res.status(200).json(populatedRegistration);
    }catch(error){
        console.error('Update Registration error:', error);
        res.status(500).json({ error: 'Server error updating Registration' });
    }
}

//delete a Registration
const deleteRegistration = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Registration'});
    }
    const result = await Registration.deleteOne({_id: id});
    if(result.deletedCount === 0){
        return res.status(400).json({error: 'No such Registration'});
    }
    return res.status(200).json({ message: 'Registration deleted successfully.' });
};

//delete multiple HC Registration
const deleteMultipleRegistration = async (req, res) => {
    try{
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: 'Expected an array of IDs.' });
        }
        // Validate all IDs
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid IDs: ${invalidIds.join(', ')}` });
        }
        const result = await Registration.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} Registration(s) deleted.`,
          deletedRegistrations: result.deletedCount,
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const activateRegistrations = async (req,res) => {
    try{
        const { ids } = req.body;
        
        if(!Array.isArray(ids) || ids.length === 0){
            return res.status(400).json({ error: 'No IDS provided.'});
        }
        if(!ids.every(id => mongoose.Types.ObjectId.isValid(id))){
            return res.status(400).json({ error: 'Invalid ids.' });
        }
        const result = await Registration.updateMany(
            { _id: { $in: ids }, status__c: 'Draft' },
            { $set: { status__c: 'Registered' } }
        );
        console.log('cc');
        return res.status(200).json({
            updated: result.modifiedCount,
            matched: result.matchedCount
        });
    } catch(error){
        console.error('activateRegistrations error:', error);

        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};

module.exports = {
    searchRegistrations,
    getSingleRegistration,
    getAllRegistrations,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    deleteMultipleRegistration,
    activateRegistrations
}