const HCUser = require('../Models/User.js');
const HCContact = require('../Models/Contact.js');
const mongoose = require('mongoose');

//Search user by name
const searchUsers = async (req,res) => {
    const query = req.query.query;
    try {
        const matches = await HCUser.find({
            email__c : { $regex: email, $options: 'i' }
        }).limit(10); // Optional limit
    
        res.status(200).json(matches);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

//Fetch Users
const fetchUsers = async (req,res) => {
    const query = req.query.query;
    try {
        
      } catch (err) {
        console.log('Error in User search',err.message);
        res.status(400).json({ error: err.message });
      }
}

//get single User
const getSingleUser = async (req,res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({error: 'No such User'});
    }
    const user = await HCUser.findById(id);
    if(!user){
        return res.status(400).json({error: 'No such User'});
    }
    res.status(200).json(user);
}

//get all Users
const getALlUsers = async (req,res) => {
    const users = await HCUser.find({});
    return res.status(200).json(users);
}

//create a User
const createUser = async (req,res) => {
    const { role__c,phone__c,email__c,password__c,otp__c,contactDetails } = req.body
    if(!role__c || (!phone__c && !email__c) || !password__c || !contactDetails?.last_Name__c || !contactDetails?.gender__c){
        return res.status(400).json({ error: 'Required fields missing.' });
    }
    const UserExists = await HCUser.find({phone__c: phone__c,start_Time__c: start_Time__c,end_Time__c: end_Time__c});
    if(UserExists.length>0){
        return res.status(400).json({ error: 'Duplicate User.' });
    }
    let time_Slot_Name__c = `${operating_Day__c} ${start_Time__c} - ${end_Time__c}`;                            
    try{
        const ts = await User.create({ time_Slot_Name__c,operating_Day__c,start_Time__c,end_Time__c })
        res.status(200).json(ts)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

//update a User
const updateUser = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid User ID' });
    }
    try{
        const existingUser = await HCUser.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Extract updates
        const { role__c, phone__c, password__c, email__c } = req.body;

        // Check for duplicate
        const duplicate = await HCUser.findOne({
            _id: { $ne: id },
            $or: [{ phone__c }, { email__c }]
        });
        if (duplicate) {
            return res.status(400).json({ error: 'Phone or Email already exists for another user' });
        }

        // Apply updates
        if (role__c) existingUser.role__c = role__c;
        if (phone__c) existingUser.phone__c = phone__c;
        if (email__c) existingUser.email__c = email__c;
        if (password__c) existingUser.password__c = password__c;

        const updatedUser = await existingUser.save();
        return res.status(200).json(updatedUser);
    }catch(err){
        console.error('Error updating user:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

//delete a user
const deleteUser = async (req,res) => {
    try{
        const userId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({error: 'No such User'});
        }
        const user = await HCUser.findById(userId);
        if(!user){
            return res.status(400).json({error: 'No such User'});
        }
        await HCContact.deleteMultipleContacts({primary_Caretaker__c: user.contact__c});
        await HCContact.findByIdAndDelete(user.contact__c);
        await HCUser.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User and related contacts deleted successfully' });
    }catch(err){
        res.status(500).json({ error: 'Delete user failed', details: err.message });
    }
}

const deactivateUser = async (req,res) => {
    try{
        const userId = req.params.id;
        const user = await HCUser.findByIdAndUpdate(userId);
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        const contactId = user.contact__c;
        user.active__c = false;
        await user.save();
        await HCContact.findByIdAndUpdate(contactId, { active__c: false });
        await HCContact.updateMany(
            {primary_Caretaker__c: contactId},
            {active__c: false}
        );
        res.status(200).json({ message: 'User and related contacts deactivated' });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    searchUsers,
    fetchUsers,
    getSingleUser,
    getALlUsers,
    createUser,
    updateUser,
    deleteUser,
    deactivateUser
}