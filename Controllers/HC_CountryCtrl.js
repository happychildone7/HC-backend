const HCCountry = require('../Models/Country.js');
const HCState = require('../Models/State.js');
const mongoose = require('mongoose');

//Search country by name
const searchCountries = async (req,res) => {
    const query = req.query.query;
    try {
        const matches = await HCCountry.find({
            name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
    
        res.status(200).json(matches);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

//Fetch Countries
const fetchCountries = async (req,res) => {
    const query = req.query.query;
    try {
        
      } catch (err) {
        console.log('Error in Country search',err.message);
        res.status(400).json({ error: err.message });
      }
}

//get single Country
const getSingleCountry = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such Country'});
    }
    const country = await HCCountry.findById(id);
    if(!country){
        return res.status(400).json({error: 'No such Country'});
    }
    res.status(200).json(country);
}

//get all Countrys
const getAllCountries = async (req,res) => {
    const countries = await HCCountry.find({});
    return res.status(200).json(countries);
}

//create a Country
const createCountry = async (req,res) => {
    const { name__c,code__c,active__c } = req.body
    if(!name__c || !code__c){
        return res.status(400).json({ error: 'Required fields missing.' });
    }
    const countryExists = await HCCountry.find({name__c: name__c,code__c: code__c});
    if(countryExists.length>0){
        return res.status(400).json({ error: 'Duplicate Country.' });
    }                        
    try{
        const country = await HCCountry.create({ name__c,code__c,active__c })
        res.status(200).json(country)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

//update a Country
const updateCountry = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Country ID' });
    }
    try{
        const existingCountry = await HCCountry.findById(id);
        if (!existingCountry) {
            return res.status(404).json({ error: 'Country not found' });
        }
        // Extract updates
        const { name__c, code__c } = req.body;

        // Check for duplicate
        const duplicate = await HCCountry.findOne({
            _id: { $ne: id },
            $or: [{ code__c }]
        });
        if (duplicate) {
            return res.status(400).json({ error: 'Code exists for another Country' });
        }

        // Apply updates
        if (name__c) existingCountry.name__c = name__c;
        if (code__c) existingCountry.code__c = code__c;

        const updatedCountry = await existingCountry.save();
        return res.status(200).json(updatedCountry);
    }catch(err){
        console.error('Error updating Country:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//delete a Country
const deleteCountry = async (req,res) => {
    try{
        const countryId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(countryId)){
            return res.status(400).json({error: 'No such Country'});
        }
        const country = await HCCountry.findById(countryId);
        if(!country){
            return res.status(400).json({error: 'No such Country'});
        }
        await HCCountry.findByIdAndDelete(countryId);
        res.status(200).json({ message: 'Country and related States deleted successfully' });
    }catch(err){
        res.status(500).json({ error: 'Delete Country failed', details: err.message });
    }
}

const deactivateCountry = async (req,res) => {
    try{
        const countryId = req.params.id;
        const country = await HCCountry.findByIdAndUpdate(countryId);
        if(!country){
            return res.status(404).json({ message: 'Country not found' });
        }
        country.active__c = false;
        await country.save();
        // Deactivate all related states
        await HCState.updateMany(
            { country__c: countryId },
            { active__c: false }
        );
        res.status(200).json({ message: 'Country and related states deactivated' });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    searchCountries,
    fetchCountries,
    getSingleCountry,
    getAllCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    deactivateCountry
}