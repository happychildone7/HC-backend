const Location = require('../Models/Location.js');
const School = require('../Models/School.js');
const Content = require('../Models/Content.js');
const fetchSchoolContent = async(req, res) => {
    try{
        const { country,state,city } = req.query;
        let locations = [];
        if(city === 'All'){
            locations = await Location.find({}).select("_id");
        }
        else{
            locations = await Location.find({ city__c: city }).select("_id");
        }
        if(!locations.length){
            return res.status(400).json({ message: 'Location not found.'});
        }
        const locIds = locations.map(l => l._id);
        const schools = await School.find({ location__c: { $in: locIds }, active__c: true }).populate('location__c');
        const schooldIds = schools.map(sc => sc._id);
        const contents = await Content.find({
                                    related_To_Id__c: { $in: schooldIds }, 
                                    related_Type__c: "School",
                                    type__c: "Image",
                                }).lean();
        const responseWrapper = getResponseWrapper(schools,contents);
        return res.status(200).json(responseWrapper);
    } catch(error){
        console.log('error',error.message);
        return res.status(500).json({ error: error.message})
    }
};

const fetchFeaturedSchoolContent = async(req, res) => {
    try{
        const { country,state,city } = req.query;
        let locations = [];
        if(city === 'All'){
            locations = await Location.find({}).select("_id");
        }
        else{
            locations = await Location.find({ city__c: city }).select("_id");
        }
        if(!locations.length){
            return res.status(400).json({ message: 'Location not found.'});
        }
        const locIds = locations.map(l => l._id);
        const schools = await School.find({ location__c: { $in: locIds }, active__c: true }).limit(3).populate('location__c');
        const schooldIds = schools.map(sc => sc._id);
        const contents = await Content.find({
                                    related_To_Id__c: { $in: schooldIds }, 
                                    related_Type__c: "School",
                                    type__c: "Image",
                                }).lean();
        const responseWrapper = getResponseWrapper(schools,contents);
        return res.status(200).json(responseWrapper);
    } catch(error){
        console.log('error',error.message);
        return res.status(500).json({ error: error.message})
    }
};

const getResponseWrapper = (schools,contents) => {
    const imageContentMap = {};
    for(const cont of contents){
        const code = cont.related_To_Code__c;
        if(!code) continue;
        if(cont.type__c === 'Image'){
            if(!imageContentMap[code]){
                imageContentMap[code] = [];
            }
            imageContentMap[code].push({
                hcContentImageId: cont._id,
                imageURL: cont.image_URL__c,
                isPrimary: cont.primary_Image__c || false
            });
        }
    }
        
    const responseWrapper = {
        schools: schools.map(school => {
            const code = school.school_Code__c;
            const images = imageContentMap[code] || [];

            return {
                entityId: school._id,
                entityHeader: school.Name__c || '',
                entityTitle: school.Name__c || '',
                entityBody1: [school.location__c?.line1__c, school.location__c?.city__c]
                                .filter(Boolean)
                                .join(', '),
                entityBody2: `<b>Admission Status</b><br />
                                <span style="background:${school.admission_Status__c === 'Ongoing' ? '#38dd3b' : school.admission_Status__c === 'Closed' ? '#f53d3d' : 'none'};color:white;padding:4px 8px;border-radius:4px;">
                                    ${school.admission_Status__c || ''}
                                </span>`,
                entityBody3: `<b>Classes Options</b><br /> ${school.beginning_Class__c || ''} - ${school.end_Class__c || ''}`,
                entityBody4: `<b>Ownership Type</b><br /> ${school.ownership_Type__c || ''}`,
                entityBody5: `<b>Fees</b><br /> &#8377;${school.fee_Monthly_Min__c || ''}+`,
                entityBody6: `<b>Board</b><br /> ${school.board__c || ''}`,
                entityBody7: `<b>Co-Ed Status</b><br /> ${school.co_Ed_Status__c || ''}`, 
                entityBody8: `<b>Type</b><br /> ${school.type__c || ''}`,
                entityBody9: `<b>Medium</b><br /> ${school.medium_Instruction__c || ''}`,
                entityBody10: `<b>Facilities</b><br /> ${school.facilities__c || ''}`,
                entityBody11: `<b>Class</b><br /> ${school.classes__c || ''}`,
                entityBody12: `<b>Rating</b><br /> ${school.rating_Avg__c || ''}`,
                entityBody13: `<b>Rating Count</b><br /> ${school.rating_Count__c || ''}`,
                entityDescription: school.desciption__c || '',
                hasLocationIcon: true,
                image: images,
            };
        })
    };
    return responseWrapper;
};

module.exports = {
    fetchSchoolContent,
    fetchFeaturedSchoolContent
}