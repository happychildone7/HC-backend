const Contact = require('../Models/Contact.js');
const HCContent = require('../Models/Content.js');
const mongoose = require('mongoose');
const { deleteCloudinaryImages } = require('../utils/cloudinaryHelper.js');

//Search Contact by Name
const searchContact = async (req,res) => {
    const query = req.query.query;
    try {
        const matches = await Contact.find({
            full_Name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
    
        res.status(200).json(matches);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

//get single contact
const getSingleContact = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Contact'});
    }
    const contact = await Contact.findById(id).lean();
    if(!contact){
        return res.status(400).json({error: 'No such Contact'});
    }
    const contents = await HCContent.find({ related_To_Id__c:  id, type__c: 'Image', related_Type__c: 'HC_Contact'}).lean();
    const images = contents.map(content => ({
        id: content._id,
        publicId: content.public_Id__c,
        url: content.image_URL__c,
        previewUrl: content.image_URL__c,
        primary: content.primary_Image__c,
        title: content.title__c
    }));
    const contactWithImages = {
        ...contact,
        images
    };
    res.status(200).json(contactWithImages);
}

//get all Contacts
const getALlContacts = async (req,res) => {
    const contact = await Contact.find({});
    return res.status(200).json(contact);
}

//create a Contact
const createContact = async (req,res) => {
    const { first_Name__c,middle_Name__c,last_Name__c,contact_Type__c,phone__c,email__c,gender__c,date_Of_Birth__c,qualification__c,specialization__c,experience_Years__c,active__c } = req.body
    if(!last_Name__c){
        return res.status(400).json({ error: 'Last Name is mandatory.' });
    }
    var full_Name__c = (first_Name__c ? first_Name__c + ' ' : '') + (middle_Name__c ? middle_Name__c + ' ' : '') + last_Name__c;
    const contactExists = await Contact.find({full_Name__c: full_Name__c});
    if(contactExists.length>0){
        return res.status(400).json({ error: 'Duplicate Contact.' });
    }
    try{
        const con = await Contact.create({ first_Name__c,middle_Name__c,last_Name__c,full_Name__c,contact_Type__c,phone__c,email__c,gender__c,date_Of_Birth__c,qualification__c,specialization__c,experience_Years__c,active__c })
        res.status(200).json(con)
    }
    catch(error){
        console.log('er>>',error.message);
        res.status(400).json({error: error.message})
    }
}

//update a Contact
const updateContact = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Contact ID' });
    }
    const existingCont = await Contact.findById(id);
    if (!existingCont) {
        return res.status(404).json({ error: 'Contact not found' });
    }
    console.log('MIdName>',req.body.middle_Name__c);
    /* const first_Name__c = req.body.first_Name__c || existingCont.first_Name__c;
    const middle_Name__c = req.body.middle_Name__c || existingCont.middle_Name__c;
    const last_Name__c = req.body.last_Name__c || existingCont.last_Name__c; */
    const first_Name__c = req.body.hasOwnProperty('first_Name__c') ? req.body.first_Name__c : existingCont.first_Name__c;
    const middle_Name__c = req.body.hasOwnProperty('middle_Name__c') ? req.body.middle_Name__c : existingCont.middle_Name__c;
    const last_Name__c = req.body.hasOwnProperty('last_Name__c') ? req.body.last_Name__c : existingCont.last_Name__c;
    const email__c = req.body.hasOwnProperty('email__c') ? req.body.email__c : existingCont.email__c;
    // Check for duplicate
    const duplicate = await Contact.findOne({
        first_Name__c,
        middle_Name__c,
        last_Name__c,
        email__c,
        _id: { $ne: id } // Exclude current record
    }).lean();

    if (duplicate) {
        return res.status(400).json({ error: 'Duplicate Contact' });
    }
    const nameParts = [first_Name__c, middle_Name__c, last_Name__c];
    const full_Name__c = nameParts.filter(Boolean).join(' ');
    // Merge updates
    const updatedFields = {
        ...req.body,
        full_Name__c: full_Name__c
    };
    const updated = await Contact.findOneAndUpdate(
        { _id: id },
        updatedFields,
        { new: true,runValidators: true }
    );
    return res.status(200).json(updated);
};

//delete a department
const deleteContact = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Contact'});
    }
    const deleteStats = await deleteContentAndCloudinaryImages([id]);
    const contact = await Contact.findOneAndDelete({_id: id})
    if(!contact){
        return res.status(400).json({error: 'No such Contact'});
    }
    return res.status(200).json({
        message: 'Contact deleted successfully.',
        deletedContact: 1,
        deletedContents: deleteStats.deletedContents,
        deletedImages: deleteStats.deletedImages
    });
}

//delete multiple Contacts
const deleteMultipleContacts = async (req, res) => {
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
        const result = await Contact.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} Contact(s) deleted.`,
          deletedCount: result.deletedCount,
          deletedContents: deleteStats.deletedContents || 0,
          deletedImages: deleteStats.deletedImages || 0
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const activateContacts = async (req,res) => {
    try{
        const { ids } = req.body;
        
        if(!Array.isArray(ids) || ids.length === 0){
            return res.status(400).json({ error: 'No IDS provided.'});
        }
        if(!ids.every(id => mongoose.Types.ObjectId.isValid(id))){
            return res.status(400).json({ error: 'Invalid ids.' });
        }
        const result = await Contact.updateMany(
            { _id: { $in: ids }, active__c: false },
            { $set: { active__c: true } }
        );
        return res.status(200).json({
            updated: result.modifiedCount,
            matched: result.matchedCount
        });
    } catch(error){
        console.error('activateContacts error:', error);

        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};
const deleteContentAndCloudinaryImages = async (contactIds) => {
    if(!Array.isArray(contactIds)){
        contactIds = [contactIds];
    }
    const contents = await HCContent.find({ related_To_Id__c: { $in: contactIds } });
    const imgPublicIds = contents.map(content => content.public_Id__c).filter(Boolean);
    let deletedImages = 0;
    if(imgPublicIds.length > 0){
        const cleanupResult = await deleteCloudinaryImages(imgPublicIds);
        deletedImages = cleanupResult.deleted || 0;
    }

    const contentDeletedResult = await HCContent.deleteMany({ related_To_Id__c: { $in: contactIds } });
    return {
        deletedContents: contentDeletedResult.deletedCount,
        deletedImages
    };
};

module.exports = {
    searchContact,
    getSingleContact,
    getALlContacts,
    createContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    activateContacts
}