const mongoose = require('mongoose');
const Contact = require('../Models/Contact.js');
const Event = require('../Models/Event.js');
const School = require('../Models/School.js');
const Promotion = require('../Models/Promotion.js');
const Content = require('../Models/Content.js');

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
    try{
        const{
                related_To_Id__c,
                related_Type__c,
                promotion_Type__c,
                duration_Days__c,
                amount__c,
                notes__c,
                created_By__c
            } = req.body;

        if(!related_To_Id__c) {
            return res.status(400).json({ error: 'Related record is required.' });
        }
        if(!related_Type__c) {
            return res.status(400).json({ error: 'Related type is required.' });
        }
        if(!created_By__c) {
            return res.status(400).json({ error: 'Created by is required.' });
        }
        if(!mongoose.Types.ObjectId.isValid(related_To_Id__c)) {
            return res.status(400).json({
                error: 'Invalid related record id.'
            });
        }
        if(!mongoose.Types.ObjectId.isValid(created_By__c)) {
            return res.status(400).json({
                error: 'Invalid created by id.'
            });
        }
        if(!duration_Days__c){
            return res.status(400).json({ error: 'Duration is required.' });
        }
        if (!amount__c) {
            return res.status(400).json({ error: 'Amount is required.' });
        }
        let recordExists = false;
        switch (related_Type__c) {
            case 'HC_Event':
                recordExists = await Event.exists({ _id: related_To_Id__c });
                break;
            case 'HC_School':
                recordExists = await School.exists({ _id: related_To_Id__c });
                break;
            /*
            case 'HC_Institute':
                recordExists = await Institute.exists({ _id: related_To_Id__c });
                break;
            case 'HC_Tutor':
                recordExists = await Tutor.exists({ _id: related_To_Id__c });
                break;
            case 'HC_Product':
                recordExists = await Product.exists({ _id: related_To_Id__c });
                break;
            */
            default:
                return res.status(400).json({ success: false,error: 'Invalid related type.' });
        }
        if (!recordExists) {
            return res.status(404).json({ success: false, error: `${related_Type__c} not found.` });
        }

        /* Auto Priority */
        let priority__c = 1;
        switch (promotion_Type__c) {
            case 'Premium':
                priority__c = 2;
                break;

            case 'Spotlight':
                priority__c = 3;
                break;

            default:
                priority__c = 1;
        }  

        /* Create Promotion */
        const promotion = await Promotion.create({
            related_To_Id__c,
            related_Type__c,
            promotion_Type__c: promotion_Type__c || 'Featured',
            priority__c,
            duration_Days__c,
            amount__c,
            active__c: false,
            payment_Status__c: 'Pending',
            start_Date__c: null,
            end_Date__c: null,
            notes__c: notes__c || null,
            created_By__c
        });
        return res.status(201).json(promotion);
    }
    catch(error){
        console.log('Create Promotion Error:',error);
        return res.status(500).json({error: error.message})
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
const getPromotionsByOwner = async(req,res) => {
    try{
        const { ownerId } = req.params;
        console.log('oc>',ownerId);
        if(!mongoose.Types.ObjectId.isValid(ownerId)){
            return res.status(400).json({error: 'Invalid owner id'});
        }
        const promotions = await Promotion.find({
            created_By__c : ownerId
        }).populate('related_To_Id__c').sort({ createdAt: -1 }).lean();
        if (!promotions.length) {
            return res.status(200).json([]);
        }
        const relatedRecords = promotions.map(promotion => promotion.related_To_Id__c?._id).filter(Boolean);
        const contents = await Content.find({
            related_To_Id__c: {
                $in: relatedRecords
            },
            type__c: 'Image'
        }).lean();

        const contentMap = {};
        contents.forEach(content => {
            const recordId = content.related_To_Id__c.toString();
            if (!contentMap[recordId]) {
                contentMap[recordId] = [];
            }
            contentMap[recordId].push(content);
        });
        const response  = promotions.map(promotion => {
            const listing = promotion.related_To_Id__c;
            const listingId = listing?._id?.toString();
            return {
                ...promotion,
                related_To_Id__c: {
                        ...listing,
                        contents: contentMap[listingId] || []
                }
            }
        });
        res.status(200).json(response);
    }catch(error){
        return res.status(500).json({
            error: error.message
        });
    }
};

const getFeaturedPromotions = async(req,res) => {
    try{
        console.log('ccbv0');
        const {
            listingType = 'HC_Event',
            promotionType= 'Featured'
        } = req.query;
        console.log('ccbv1');
        const promotions = await Promotion.find({
                active__c: true,
                promotion_Type__c: promotionType,
                related_Type__c: listingType
            })
            .populate('related_To_Id__c')
            .sort({
                createdAt: -1
            })
            .lean();
        console.log('ccbv2');
        if (!promotions.length) {
            return res.status(200).json([]);
        }

        const listingIds = promotions.map(promotion => promotion.related_To_Id__c?._id).filter(Boolean);
        const contents = await Content.find({
            related_To_Id__c: {
                $in: listingIds
            },
            type__c: 'Image'
        }).lean();
        const contentMap = {};
        contents.forEach(content => {
            const recordId = content.related_To_Id__c.toString();
            if (!contentMap[recordId]) {
                contentMap[recordId] = [];
            }
            contentMap[recordId].push(content);
        });
        console.log('ccbv3');
        const response = promotions.map(promotion => {
            console.log('ccbv4');
            const listing = promotion.related_To_Id__c;
            const listingId = listing?._id?.toString();
            const images = contentMap[listingId] || [];
            const primaryImage = images.find(img => img.primary_Image__c) || images[0];

            return {
                promotionId: promotion._id,
                promotionNumber: promotion.promotion_Number__c,
                promotionType: promotion.promotion_Type__c,
                startDate: promotion.start_Date__c,
                endDate: promotion.end_Date__c,
                listingId: listing?._id,
                listingType: promotion.related_Type__c,
                listingName:
                    listing?.event_Name__c ||
                    listing?.school_Name__c ||
                    listing?.institute_Name__c ||
                    listing?.tutor_Name__c,
                listing,
                image: primaryImage?.image_URL__c || null
            };
        });
        return res.status(200).json(response);
    }catch(err){
        console.log(error);
        return res.status(500).json({ error: error.message });
    } 
}

module.exports = {
    searchPromotions,
    getSinglePromotion,
    getAllPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    deleteMultiplePromotion,
    activatePromotions,
    deactivatePromotions,
    getPromotionsByOwner,
    getFeaturedPromotions
}