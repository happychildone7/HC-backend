const mongoose = require('mongoose');
const Contact = require('../Models/Contact.js');
const Event = require('../Models/Event.js');
const Wishlist = require('../Models/Wishlist.js');

//Search Wishlist
const searchWishlists = async (req,res) => {
    const { query } = req.query;
    try {
        const matches = await Wishlist.find({
            wishlist_Number__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
        return res.status(200).json(matches);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
};

//get single Wishlist
const getSingleWishlist = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Wishlist'});
    }
    const wishlist = await Wishlist.findById(id).populate('contact__c').lean();
    if(!wishlist){
        return res.status(400).json({error: 'No such Wishlist'});
    }
    res.status(200).json(wishlist);
}

//get all Wishlists
const getAllWishlists = async (req,res) => {
    const wishlists = await Wishlist.find({}).populate('contact__c');
    return res.status(200).json(wishlists);
}

//create a Wishlist
const createWishlist = async (req,res) => {
    console.log('check>><>',req.body);
    req.body.contact__c = req.body.contact__c || null;
    req.body.related_To_Id__c = req.body.related_To_Id__c || '';
    req.body.related_Type__c = req.body.related_Type__c || 'None';
    req.body.related_To_Code__c = req.body.related_To_Code__c || '';
    req.body.wishlist_Type__c = req.body.wishlist_Type__c || 'Wishlist';
    req.body.notes__c = req.body.notes__c || '';

    const { 
            contact__c,
            related_To_Id__c,
            related_Type__c,
            related_To_Code__c,
            wishlist_Type__c,
            notes__c
        } = req.body;

    if(!contact__c) {
      return res.status(400).json({ error: 'Contact is required.' });
    }

    if(!related_To_Id__c) {
      return res.status(400).json({ error: 'Related to is required.' });
    }

    if(contact__c){
        const contExists = await Contact.findById(contact__c);
        if (!contExists) {
            console.log('no contact');
            return res.status(400).json({ error: 'Invalid contact selected.' });
        }
    }
    const duplicateExists = await Wishlist.findOne({ contact__c, related_To_Id__c, related_Type__c });
    if(duplicateExists){
        return res.status(400).json({ error: 'This contact has already wishlisted for this item.' });
    }

    try{
        const wishlist = await Wishlist.create({ 
                                            contact__c,related_To_Id__c,related_Type__c,related_To_Code__c,
                                            wishlist_Type__c,notes__c
                                        });
        return res.status(200).json(wishlist);
    }
    catch(error){
        console.log('some error',error);
        return res.status(400).json({error: error.message})
    }
}

//update a Wishlist
const updateWishlist = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Wishlist'});
    }
    try{
        const wishlist = await Wishlist.findOneAndUpdate(
            { _id: id }, 
            { $set: req.body },  
            { 
                new: true,          
                runValidators: true  
            }
        );
        if(!wishlist){
            return res.status(400).json({error: 'No such Wishlist'});
        }
        const populatedWishlist = await Wishlist.findById(id)
            .populate('contact__c')
            .lean();
        return res.status(200).json(populatedWishlist);
    }catch(error){
        console.error('Update Wishlist error:', error);
        res.status(500).json({ error: 'Server error updating Wishlist' });
    }
}

//delete a Wishlist
const deleteWishlist = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Wishlist'});
    }
    const result = await Wishlist.deleteOne({_id: id});
    if(result.deletedCount === 0){
        return res.status(400).json({error: 'No such Wishlist'});
    }
    return res.status(200).json({ message: 'Wishlist deleted successfully.' });
};

//delete multiple HC Wishlist
const deleteMultipleWishlist = async (req, res) => {
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
        const result = await Wishlist.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} Wishlist(s) deleted.`,
          deletedWishlists: result.deletedCount,
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    searchWishlists,
    getSingleWishlist,
    getAllWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    deleteMultipleWishlist
}