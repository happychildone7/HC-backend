const Location = require('../Models/Location.js');
const mongoose = require('mongoose');

//Search locations
const searchLocations = async (req,res) => {
    const query = req.query.query;
    try {
        const matches = await Location.find({
            location_Name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
    
        res.status(200).json(matches);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
}

//get single location
const getSingleLocation = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Location'});
    }
    const location = await Location.findById(id);
    if(!location){
        return res.status(400).json({error: 'No such Location'});
    }
    res.status(200).json(location);
}

//get all locations
const getALlLocations = async (req,res) => {
    const locations = await Location.find({});
    return res.status(200).json(locations);
}

//create a location
const createLocation = async (req,res) => {
    let { line1__c,line2__c,location_Name__c,location_Type__c,city__c,state__c,country__c,pin__c,coordinates__c } = req.body;
    console.log('checkk<>'+JSON.stringify(req.body));
    if(!location_Name__c || !location_Name__c.trim()){
        const safeLine1 = line1__c || '';
        const safeCity = city__c || '';
        location_Name__c = `${safeLine1} ${safeCity}`.trim();
    }
    try{
        const loc = await Location.create({ line1__c,line2__c,location_Name__c,location_Type__c,city__c,state__c,country__c,pin__c,coordinates__c });
        res.status(200).json(loc);
    }
    catch(error){
        res.status(400).json({error: error.message});
    }
}

//delete a location
const deleteLocation = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Location'});
    }
    const location = await Location.findOneAndDelete({_id: id})
    if(!location){
        return res.status(400).json({error: 'No such Location'});
    }
    return res.status(200).json(location)
}

//update a location
const updateLocation = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Location'});
    }
    try{
        const location = await Location.findOneAndUpdate(
            { _id: id }, 
            { $set: req.body },  
            { 
                new: true,      
                runValidators: true 
            }
        )
        if(!location){
            return res.status(400).json({error: 'No such Location'});
        }
        return res.status(200).json(location);
    }catch(error){
        console.error('Update location error:', error);
        res.status(500).json({ error: 'Server error updating location' });
    }
}

//delete multiple location
const deleteMultipleHCLocation = async (req, res) => {
    try{
        const ids = req.body;
        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: 'Expected an array of IDs.' });
        }
        // Validate all IDs
        const invalidIds = ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ error: `Invalid IDs: ${invalidIds.join(', ')}` });
        }
    
        const result = await Location.deleteMany({ _id: { $in: ids } });
    
        return res.status(200).json({
          message: `${result.deletedCount} location(s) deleted.`,
          deletedCount: result.deletedCount,
        });
    }catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    searchLocations,
    getSingleLocation,
    getALlLocations,
    createLocation,
    deleteLocation,
    deleteMultipleHCLocation,
    updateLocation
}