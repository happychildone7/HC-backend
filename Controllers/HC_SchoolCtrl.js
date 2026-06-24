const mongoose = require('mongoose');
const Location = require('../Models/Location.js');
const School = require('../Models/School.js');
const User = require('../Models/User.js');
const Contact = require('../Models/Contact.js');
const HCContent = require('../Models/Content.js');
const { deleteCloudinaryImages } = require('../utils/cloudinaryHelper.js');

//Search School
const searchSchools = async (req,res) => {
    console.log('cc>.');
    const { query } = req.query;
    try {
        const matches = await School.find({
            Name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
        return res.status(200).json(matches);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
};

//get single School
const getSingleSchool = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such School'});
    }
    const school = await School.findById(id).populate('location__c').populate('contact__c').lean();
    if(!school){
        return res.status(400).json({error: 'No such School'});
    }
    const contents = await HCContent.find({ related_To_Id__c:  id, type__c: 'Image', related_Type__c: 'HC_School'}).lean();
    const images = contents.map(content => ({
        id: content._id,
        publicId: content.public_Id__c,
        url: content.image_URL__c,
        previewUrl: content.image_URL__c,
        primary: content.primary_Image__c,
        title: content.title__c
    }));
    const schoolWithImages = {
        ...school,
        images
    };
    res.status(200).json(schoolWithImages);
}

//get all Schools
const getAllSchools = async (req,res) => {
    const Schools = await School.find({}).populate('location__c').populate('contact__c');
    return res.status(200).json(Schools);
}

//create a School
const createSchool = async (req,res) => {
    console.log('check>><>',req.body);
    if (!req.body.contact__c) {
        req.body.contact__c = null;
    }
    console.log('req<,',req.body);
    const { 
        Name__c,
        description__c,
        location__c,
        contact__c,
        board__c,
        ownership_Type__c,
        type__c,
        fee_Monthly_Min__c,
        co_Ed_Status__c,
        medium_Instruction__c,
        classes__c,
        age_Criteria_Min__c,
        age_Criteria_Max__c,
        facilities__c,
        rating_Avg__c,
        rating_Count__c,
        admission_Status__c,
        status__c,
        active__c,
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
    if (!Array.isArray(classes__c) || classes__c.length === 0) {
        return res.status(400).json({ error: 'Classes are required' });
    }

    let beginning_Class__c = classes__c?.[0] || null;
    let end_Class__c = classes__c?.[classes__c.length - 1] || null;

    if(location__c){
        const locationExists = await Location.findById(location__c);
        if (!locationExists) {
            return res.status(400).json({ error: 'Invalid location selected.' });
        }
        console.log('no loc');
    }
    try{
        const school = await School.create({ Name__c,description__c,location__c,contact__c,board__c,ownership_Type__c,type__c,fee_Monthly_Min__c,co_Ed_Status__c,medium_Instruction__c,classes__c,age_Criteria_Min__c,age_Criteria_Max__c,beginning_Class__c,end_Class__c,facilities__c,rating_Avg__c,rating_Count__c,admission_Status__c,status__c,active__c,primary_Contact__c,owner__c });
        return res.status(200).json(school);
    }
    catch(error){
        console.log('some error',error);
        return res.status(400).json({error: error.message})
    }
}

//update a School
const updateSchool = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such School'});
    }
    try{
        const currentSchool = await School.findById(id).lean();
        if(!currentSchool) return res.status(404).json({error: 'School not found.'});

        const updateData = { $set: req.body };

        if (req.body.classes__c && JSON.stringify(currentSchool.classes__c) !== JSON.stringify(req.body.classes__c)) {
            const classes = req.body.classes__c;
            updateData.$set.beginning_Class__c = classes?.[0] || null;
            updateData.$set.end_Class__c = classes?.[classes.length - 1] || null;
        }
        const school = await School.findOneAndUpdate(
            { _id: id }, 
            updateData,  
            { 
                new: true,          
                runValidators: true  
            }
        );
        if(!school){
            return res.status(400).json({error: 'No such School'});
        }
        const populatedSchool = await School.findById(id)
            .populate('location__c')
            .populate('owner__c')
            .lean();
        return res.status(200).json(populatedSchool);
    }catch(error){
        console.error('Update school error:', error);
        res.status(500).json({ error: 'Server error updating school' });
    }
}

//delete a School
const deleteSchool = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such School'});
    }
    const deleteStats = await deleteContentAndCloudinaryImages([id]);
    const result = await School.deleteOne({_id: id});
    if(result.deletedCount === 0){
        return res.status(400).json({error: 'No such School'});
    }
    return res.status(200).json({
        message: 'School deleted successfully.',
        deletedSchool: 1,
        deletedContents: deleteStats.deletedContents,
        deletedImages: deleteStats.deletedImages
    });
};

//delete multiple HC School
const deleteMultipleSchool = async (req, res) => {
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
        const result = await School.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} School(s) deleted.`,
          deletedSchools: result.deletedCount,
          deletedContents: deleteStats.deletedContents || 0,
          deletedImages: deleteStats.deletedImages || 0
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const activateSchools = async (req,res) => {
    const { ids } = req.body;
    
    if(!Array.isArray(ids) || ids.length === 0){
        return res.status(400).json({ error: 'No IDS provided.'});
    }
    if(!ids.every(id => mongoose.Types.ObjectId.isValid(id))){
        return res.status(400).json({ error: 'Invalid ids.' });
    }
    const result = await School.updateMany(
        { _id: { $in: ids }, active__c: false },
        { $set: { active__c: true, status__c: 'Published' } }
    );
    return res.status(200).json({
        updated: result.modifiedCount,
        matched: result.matchedCount
    });
};
const deleteContentAndCloudinaryImages = async (schoolIds) => {
    if(!Array.isArray(schoolIds)){
        schoolIds = [schoolIds];
    }
    const contents = await HCContent.find({ related_To_Id__c: { $in: schoolIds } });
    const imgPublicIds = contents.map(content => content.public_Id__c).filter(Boolean);
    let deletedImages = 0;
    if(imgPublicIds.length > 0){
        const cleanupResult = await deleteCloudinaryImages(imgPublicIds);
        deletedImages = cleanupResult.deleted || 0;
    }

    const contentDeletedResult = await HCContent.deleteMany({ related_To_Id__c: { $in: schoolIds } });
    return {
        deletedContents: contentDeletedResult.deletedCount,
        deletedImages
    };
};

module.exports = {
    searchSchools,
    getSingleSchool,
    getAllSchools,
    createSchool,
    updateSchool,
    deleteSchool,
    deleteMultipleSchool,
    activateSchools
}