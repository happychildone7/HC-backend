const HCState = require('../Models/State.js');
const mongoose = require('mongoose');

//Search State by name
const searchStates = async (req,res) => {
    const query = req.query.query;
    try {
        const matches = await HCState.find({
            name__c : { $regex: query, $options: 'i' }
        }).limit(10); // Optional limit
    
        res.status(200).json(matches);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

//Fetch States by country
const fetchStates = async (req,res) => {
    const {country__c} = req.query;
    console.log('country>',country__c);
    try {
        const states = await HCState.find({
            country__c : country__c
        });
        if(!states) return res.status(400).json({error: 'No states found for the country'});
        return res.status(200).json(states);
      } catch (err) {
        console.log('Error in State search',err.message);
        res.status(400).json({ error: err.message });
      }
}

//get single State
const getSingleState = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such State'});
    }
    const state = await HCState.findById(id);
    if(!state){
        return res.status(400).json({error: 'No such State'});
    }
    return res.status(200).json(state);
}

//get all States
const getAllStates = async (req,res) => {
    const states = await HCState.find({});
    return res.status(200).json(states);
}

//create a State
const createState = async (req,res) => {
    const { name__c,code__c,country__c,active__c } = req.body
    if(!name__c || !code__c || !country__c){
        return res.status(400).json({ error: 'Required fields missing.' });
    }
    const stateExists = await HCState.find({name__c: name__c,code__c: code__c});
    if(stateExists.length>0){
        return res.status(400).json({ error: 'Duplicate State.' });
    }                        
    try{
        const state = await HCState.create({ name__c,code__c,country__c,active__c })
        res.status(200).json(state)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

// Bulk create states
const bulkCreateState = async (req, res) => {
    const states = req.body;
    if (!Array.isArray(states) || states.length === 0) {
        return res.status(400).json({ error: 'No states provided.' });
    }
    try {
        const created = await HCState.insertMany(states, { ordered: false });
        res.status(200).json(created);
    } catch(error) {
        res.status(400).json({ error: error.message });
    }
}


//update a State
const updateState = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid State ID' });
    }
    try{
        const existingState = await HCState.findById(id);
        if (!existingState) {
            return res.status(404).json({ error: 'State not found' });
        }
        // Extract updates
        const { code__c } = req.body;

        // Check for duplicate
        const duplicate = await HCState.findOne({
            _id: { $ne: id },
            $or: [{ code__c }]
        });
        if (duplicate) {
            return res.status(400).json({ error: 'Code exists for another State' });
        }

        // Apply updates
        if (name__c) existingState.name__c = name__c;
        if (code__c) existingState.code__c = code__c;
        if (country__c) existingState.country__c = country__c;

        const updatedState = await existingState.save();
        return res.status(200).json(updatedState);
    }catch(err){
        console.error('Error updating State:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//delete a State
const deleteState = async (req,res) => {
    try{
        const stateId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(stateId)){
            return res.status(400).json({error: 'No such State'});
        }
        const state = await HCState.findById(stateId);
        if(!state){
            return res.status(400).json({error: 'No such State'});
        }
        await HCState.findByIdAndDelete(stateId);
        res.status(200).json({ message: 'State deleted successfully' });
    }catch(err){
        res.status(500).json({ error: 'Delete State failed', details: err.message });
    }
}

const deactivateState = async (req,res) => {
    try{
        const stateId = req.params.id;
        const state = await HCState.findByIdAndUpdate(stateId);
        if(!state){
            return res.status(404).json({ message: 'State not found' });
        }
        state.active__c = false;
        await state.save();
        res.status(200).json({ message: 'State deactivated' });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    searchStates,
    fetchStates,
    getSingleState,
    getAllStates,
    createState,
    bulkCreateState,
    updateState,
    deleteState,
    deactivateState
}