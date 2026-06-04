const HCCity = require('../Models/City.js');
const mongoose = require('mongoose');

//Search City by name
const searchCities = async (req,res) => {
    const query = req.query.query;
    try {
        const matches = await HCCity.find({
            name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
    
        res.status(200).json(matches);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

//Fetch Cities by state
const fetchCities = async (req,res) => {
    const {state__c} = req.query;
    try {
        const cities = await HCCity.find({
            state__c : state__c
        });
        if(!cities) return res.status(400).json({error: 'No Cities found for the country'});
        return res.status(200).json(cities);
      } catch (err) {
        console.log('Error in City search',err.message);
        res.status(400).json({ error: err.message });
      }
}

//get single City
const getSingleCity = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such City'});
    }
    const city = await HCCity.findById(id);
    if(!city){
        return res.status(400).json({error: 'No such City'});
    }
    return res.status(200).json(city);
}

//get all Cities
const getAllCities = async (req,res) => {
    const cities = await HCCity.find({});
    return res.status(200).json(cities);
}

//create a City
const createCity = async (req,res) => {
    const { name__c,code__c,state__c,active__c } = req.body
    if(!name__c || !code__c || !state__c){
        return res.status(400).json({ error: 'Required fields missing.' });
    }
    const cityExists = await HCCity.find({name__c: name__c,code__c: code__c});
    if(cityExists.length>0){
        return res.status(400).json({ error: 'Duplicate City.' });
    }                        
    try{
        const city = await HCCity.create({ name__c,code__c,state__c,active__c })
        res.status(200).json(city)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

// Bulk create Cities
const bulkCreateCity = async (req, res) => {
    const cities = req.body;
    if (!Array.isArray(cities) || cities.length === 0) {
        return res.status(400).json({ error: 'No Cities provided.' });
    }
    try {
        const created = await HCCity.insertMany(cities, { ordered: false });
        res.status(200).json(created);
    } catch(error) {
        res.status(400).json({ error: error.message });
    }
}


//update a City
const updateCity = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid City ID' });
    }
    try{
        const existingCity = await HCCity.findById(id);
        if (!existingCity) {
            return res.status(404).json({ error: 'City not found' });
        }
        // Extract updates
        const { code__c } = req.body;

        // Check for duplicate
        const duplicate = await HCCity.findOne({
            _id: { $ne: id },
            $or: [{ code__c }]
        });
        if (duplicate) {
            return res.status(400).json({ error: 'Code exists for another City' });
        }

        // Apply updates
        if (name__c) existingCity.name__c = name__c;
        if (code__c) existingCity.code__c = code__c;
        if (state__c) existingCity.state__c = state__c;

        const updatedCity = await existingCity.save();
        return res.status(200).json(updatedCity);
    }catch(err){
        console.error('Error updating City:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//delete a City
const deleteCity = async (req,res) => {
    try{
        const cityId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(cityId)){
            return res.status(400).json({error: 'No such City'});
        }
        const city = await HCCity.findById(cityId);
        if(!city){
            return res.status(400).json({error: 'No such City'});
        }
        await HCCity.findByIdAndDelete(cityId);
        res.status(200).json({ message: 'City deleted successfully' });
    }catch(err){
        res.status(500).json({ error: 'Delete City failed', details: err.message });
    }
}

const deactivateCity = async (req,res) => {
    try{
        const cityId = req.params.id;
        const city = await HCCity.findByIdAndUpdate(cityId);
        if(!city){
            return res.status(404).json({ message: 'City not found' });
        }
        city.active__c = false;
        await city.save();
        res.status(200).json({ message: 'City deactivated' });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    searchCities,
    fetchCities,
    getSingleCity,
    getAllCities,
    createCity,
    bulkCreateCity,
    updateCity,
    deleteCity,
    deactivateCity
}