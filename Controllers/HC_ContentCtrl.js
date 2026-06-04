const HCContent = require('../Models/Content.js');
const HCLocation = require('../Models/Location.js');
const HCSchool = require('../Models/School.js');
const { deleteCloudinaryImages } = require('../utils/cloudinaryHelper.js');
const mongoose = require('mongoose');

//get single HC Content
const getSingleHCContent = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such HC Content'});
    }
    const content = await HCContent.findById(id).populate('location__c').populate('related_To_Id__c').lean();
    if(!content){
        return res.status(400).json({error: 'No such HC Content'});
    }
    if(content.related_Type__c === 'School') {
        const school = await HCSchool.findById(content.related_To_Id__c).lean();
        content.related_To_Id__c = school;
    } else if (content.related_Type__c === 'Tutor') {
        
    }
    console.log('GETSINGLECONTENT>');
    res.status(200).json(content);
}

//get all HC Content
const getALlHCContent = async (req,res) => {
    try{
        const contents = await HCContent.find({}).populate('location__c').lean();
        // Manual population
        for (let content of contents) {
            if (content.related_Type__c === 'School') {
                const school = await HCSchool.findById(content.related_To_Id__c).lean();
                content.related_To_Id__c = school;
            } 
            // Add other types as needed
        }
        return res.status(200).json(contents);
    } catch(error){
        console.error('Error fetching contents:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

//create an HC Content
const createHCContent = async (req,res) => {
    const { related_Type__c,related_To_Id__c,type__c,location__c,primaryImage,title__c,description__c,image_URL__c,public_Id__c,related_To_Code__c,active__c } = req.body;
    var primary_Image__c = String(primaryImage).toLowerCase() === 'true';
    if(location__c){
        const locationExists = await HCLocation.findById(location__c);
        if (!locationExists) {
            return res.status(400).json({ error: 'Invalid location selected.' });
        }
    }
    try{
        const cont = await HCContent.create({
                                                related_Type__c,
                                                related_To_Id__c,
                                                type__c,
                                                location__c,
                                                primary_Image__c,
                                                title__c,
                                                description__c,
                                                image_URL__c,
                                                public_Id__c,
                                                related_To_Code__c,
                                                active__c
                                            })
        res.status(200).json(cont)
    }
    catch(error){
        console.log('ER<><',error.message);
        res.status(400).json({error: error.message})
    }
}

//delete an HC Content
const deleteHCContent = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such HC Content'});
    }
    const content = await HCContent.find({ _id: id });
    const deleteStats = await deleteCloudinaryImages(content.public_Id__c);
    const result = await HCContent.findOneAndDelete({_id: id});
    if(!content){
        return res.status(400).json({error: 'No such HC Content'});
    }
    return res.status(200).json({
        message: `${result.deletedCount} content deleted.`,
        deletedContents: result.deletedCount,
        deletedImages: deleteStats.deleted
    });
}

//delete multiple HC Content
const deleteMultipleHCContent = async (req, res) => {
    try{
        const ids = req.body;
        console.log('IDS>',ids);
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: 'Expected an array of IDs.' });
        }
        // Validate all IDs
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid IDs: ${invalidIds.join(', ')}` });
        }
        const contents = await HCContent.find({ _id: { $in: ids } });
        const imgPublicIds = contents.map(content => content.public_Id__c).filter(Boolean);
        const deleteStats = await deleteCloudinaryImages(imgPublicIds);
        const result = await HCContent.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} content(s) deleted.`,
          deletedContents: result.deletedCount,
          deletedImages: deleteStats.deleted
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//delete contents by relatedto Ids
const deleteByRelatedIds = async (req,res) => {
    try{
        const { relatedToIds } = req.body;
        console.log('relatedToIds>',relatedToIds);
        if (!relatedToIds || !Array.isArray(relatedToIds)) {
          return res.status(400).json({ error: 'Expected an array of IDs.' });
        }
        if (relatedToIds.length === 0) {
            return res.status(200).json({ message: 'No IDs provided', deletedCount: 0 });
        }
        // Validate all IDs
        const invalidIds = relatedToIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid IDs: ${invalidIds.join(', ')}` });
        }
        const contents = await HCContent.find({ related_To_Id__c: { $in: relatedToIds } });
        if (contents.length === 0) {
            return res.status(200).json({ message: 'No content found', deletedCount: 0 });
        }
        const imgPublicIds = contents.map(content => content.public_Id__c).filter(Boolean);
        const deleteStats = await deleteCloudinaryImages(imgPublicIds);
        const result = await HCContent.deleteMany(
                                { _id: { $in: contents.map(c => c._id) } 
                            });
    
        return res.status(200).json({
          message: `${result.deletedCount} content(s) deleted.`,
          deletedContents: result.deletedCount,
          deletedImages: deleteStats.deleted
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update an HC Content
const updateHCContent = async (req,res) => {
    const { id } = req.params;
    const { related_Type__c,related_To_Id__c,type__c,location__c,primaryImage,title__c,description__c,image_URL__c,public_Id__c,related_To_Code__c,active_c } = req.body;
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'No such HC Content' });
    }
    if (location__c && mongoose.Types.ObjectId.isValid(location__c)) {
        const locationExists = await HCLocation.findById(location__c);
        if (!locationExists) {
            return res.status(400).json({ error: 'Invalid location selected.' });
        }
    }
    const duplicateContent = await HCContent.findOne({
        _id: { $ne: id }, // exclude current record during update
        related_Type__c,
        related_To_Id__c,
        type__c,
        title__c,
        image_URL__c
    });
    if (duplicateContent) {
        return res.status(400).json({ error: 'Duplicate HC Content already exists.' });
    }
    var primary_Image__c = String(primaryImage).toLowerCase() === 'true';
    const formData = { related_Type__c,related_To_Id__c,type__c,location__c,primary_Image__c,title__c,description__c,image_URL__c,public_Id__c,related_To_Code__c,active_c };
    console.log('UPDID>',formData);
    const content = await HCContent.findOneAndUpdate(
        {_id: id}, 
        {...formData},
        { new: true } // <-- returns the updated document
    )
    if(!content){
        return res.status(400).json({error: 'No such HC Content'});
    }
    return res.status(200).json(content)
}

module.exports = {
    getSingleHCContent,
    getALlHCContent,
    createHCContent,
    deleteHCContent,
    deleteMultipleHCContent,
    deleteByRelatedIds,
    updateHCContent
}