const mongoose = require('mongoose');
const Contact = require('../Models/Contact.js');
const Event = require('../Models/Event.js');
const School = require('../Models/School.js');
const Promotion = require('../Models/Promotion.js');

//Search Promotion
const searchPromotions = async (req,res) => {
    const { query } = req.query;
    try {
        const matches = await Promotion.find({
            promotion_Number__c : { $regex: query, $options: 'i' }
        }).sort({ createdAt: -1 }).limit(10); // Optional limit
        return res.status(200).json(matches);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
};

//get single Promotion
const getSinglePromotion = async (req,res) => {
    try{
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({error: 'No such Promotion'});
        }
        const promotion = await Promotion.findById(id).lean();
        if(!promotion){
            return res.status(400).json({error: 'No such Promotion'});
        }
        res.status(200).json(promotion);
    }catch(error){
        return res.status(500).json({
            error: error.message
        });
    }
}

//get all Promotions
const getAllPromotions = async (req,res) => {
    try{
        const promotions = await Promotion.find({}).sort({ createdAt: -1 });
        return res.status(200).json(promotions);
    }catch(error){
        return res.status(500).json({
            error: error.message
        });
    }
}

//create a Promotion
const createPromotion = async (req,res) => {
    console.log('check>><>',req.body);
    req.body.promotion_Type__c = req.body.promotion_Type__c ?? 'Featured';
    req.body.priority__c = req.body.priority__c ?? 1;
    req.body.start_Date__c = req.body.start_Date__c || null;
    req.body.end_Date__c = req.body.end_Date__c || null;
    req.body.active__c = req.body.active__c ?? false;
    req.body.payment_Status__c = req.body.payment_Status__c ?? 'Pending';
    req.body.notes__c = req.body.notes__c || null;

    const { 
            related_To_Id__c,
            related_Type__c,
            promotion_Type__c,
            priority__c,
            start_Date__c,
            end_Date__c,
            active__c,
            payment_Status__c,
            notes__c
        } = req.body;

    if(!related_To_Id__c) {
      return res.status(400).json({ error: 'Related to is required.' });
    }
    if(!related_Type__c) {
      return res.status(400).json({ error: 'Related type is required.' });
    }
    if(!mongoose.Types.ObjectId.isValid(related_To_Id__c)) {
        return res.status(400).json({
            error: 'Invalid related record id.'
        });
    }
    /* Validate Event Exists */
    if(related_Type__c === 'Event'){
        const event = await Event.findById(
            related_To_Id__c
        );
        if(!event){
            return res.status(400).json({
                error: 'Event not found.'
            });
        }
    }
    else if(related_Type__c === 'School'){
        const school = await School.findById(
            related_To_Id__c
        );
        if(!school){
            return res.status(400).json({
                error: 'School not found.'
            });
        }
    }
    /* else if(related_Type__c === 'Institute'){
        const institute = await Institute.findById(
            related_To_Id__c
        );
        if(!institute){
            return res.status(400).json({
                error: 'Institute not found.'
            });
        }
    }
    else if(related_Type__c === 'Tutor'){
        const tutor = await Tutor.findById(
            related_To_Id__c
        );
        if(!tutor){
            return res.status(400).json({
                error: 'Tutor not found.'
            });
        }
    }
   else if(related_Type__c === 'Product'){
        const product = await Product.findById(
            related_To_Id__c
        );
        if(!product){
            return res.status(400).json({
                error: 'Product not found.'
            });
        }
    } */
   /* Date Validation */
    if(start_Date__c && end_Date__c && new Date(start_Date__c) > new Date(end_Date__c)){
        return res.status(400).json({
            error:
                'End date must be greater than start date.'
        });
    }


    try{
        const promotion = await Promotion.create({ 
                                            related_To_Id__c,related_Type__c,promotion_Type__c,priority__c,start_Date__c,
                                            end_Date__c,active__c,payment_Status__c,notes__c
                                        });
        return res.status(200).json(promotion);
    }
    catch(error){
        console.log('some error',error);
        return res.status(400).json({error: error.message})
    }
}

//update a Promotion
const updatePromotion = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Promotion'});
    }
    if(req.body.start_Date__c && req.body.end_Date__c && new Date(req.body.start_Date__c) > new Date(req.body.end_Date__c)){
        return res.status(400).json({
            error:
                'End date must be greater than start date.'
        });
    }
    try{
        const promotion = await Promotion.findOneAndUpdate(
            { _id: id }, 
            { $set: req.body },  
            { 
                new: true,          
                runValidators: true  
            }
        );
        if(!promotion){
            return res.status(400).json({error: 'No such Promotion'});
        }
        const populatedPromotion = await Promotion.findById(id);
        return res.status(200).json(populatedPromotion);
    }catch(error){
        console.error('Update Promotion error:', error);
        res.status(500).json({ error: 'Server error updating Promotion' });
    }
}

//delete a Promotion
const deletePromotion = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Promotion'});
    }
    const result = await Promotion.deleteOne({_id: id});
    if(result.deletedCount === 0){
        return res.status(400).json({error: 'No such Promotion'});
    }
    return res.status(200).json({ message: 'Promotion deleted successfully.' });
};

//delete multiple HC Promotion
const deleteMultiplePromotion = async (req, res) => {
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
        const result = await Promotion.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} Promotion(s) deleted.`,
          deletedPromotions: result.deletedCount,
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const activatePromotions = async (req,res) => {
    try{
        const { ids } = req.body;
        
        if(!Array.isArray(ids) || ids.length === 0){
            return res.status(400).json({ error: 'No IDS provided.'});
        }
        if(!ids.every(id => mongoose.Types.ObjectId.isValid(id))){
            return res.status(400).json({ error: 'Invalid ids.' });
        }
        const result = await Promotion.updateMany(
            { _id: { $in: ids }, payment_Status__c: 'Paid' },
            { $set: { active__c: true } }
        );
        console.log('cc');
        return res.status(200).json({
            updated: result.modifiedCount,
            matched: result.matchedCount
        });
    } catch(error){
        console.error('activatePromotions error:', error);

        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};
const deactivatePromotions = async (req,res) => {
    try {
        const { ids } = req.body;
        if(!Array.isArray(ids) || ids.length === 0){
            return res.status(400).json({
                error: 'No ids provided.'
            });
        }
        if(!ids.every(id => mongoose.Types.ObjectId.isValid(id))){
            return res.status(400).json({
                error: 'Invalid ids.'
            });
        }
        const result =
            await Promotion.updateMany(
                {
                    _id: { $in: ids }
                },
                {
                    $set: {
                        active__c: false
                    }
                }
            );

        return res.status(200).json({
            updated: result.modifiedCount,
            matched: result.matchedCount
        });
    }catch(error){
        console.error(
            'deactivatePromotions error:',
            error
        );
        return res.status(500).json({
            error:
                'Internal server error'
        });
    }
};

module.exports = {
    searchPromotions,
    getSinglePromotion,
    getAllPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    deleteMultiplePromotion,
    activatePromotions,
    deactivatePromotions
}