const Location = require('../Models/Location.js');
const Event = require('../Models/Event.js');
const Content = require('../Models/Content.js');
const fetchEventContent = async(req, res) => {
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
        const events = await Event.find({ location__c: { $in: locIds }, active__c: true }).populate('location__c');
        const eventdIds = events.map(ev => ev._id);
        const contents = await Content.find({
                                    related_To_Id__c: { $in: eventdIds }, 
                                    related_Type__c: "HC_Event",
                                    type__c: "Image",
                                }).lean();
        const responseWrapper = getResponseWrapper(events,contents);
        return res.status(200).json(responseWrapper);
    } catch(error){
        console.log('error',error.message);
        return res.status(500).json({ error: error.message})
    }
};

const fetchFeaturedEventContent = async(req, res) => {
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
        const events = await Event.find({ location__c: { $in: locIds }, active__c: true }).limit(3);
        const eventdIds = events.map(sc => sc._id);
        const contents = await Content.find({
                                    related_To_Id__c: { $in: eventdIds }, 
                                    related_Type__c: "HC_Event",
                                    type__c: "Image",
                                }).lean();
        const responseWrapper = getResponseWrapper(events,contents);
        return res.status(200).json(responseWrapper);
    } catch(error){
        console.log('error',error.message);
        return res.status(500).json({ error: error.message})
    }
};

const getResponseWrapper = (events,contents) => {
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
        events: events.map(event => {
            const code = event.event_Code__c;
            const images = imageContentMap[code] || [];

            return {
                entityId: event._id,
                entityHeader: event.Name__c || '',
                entityTitle: event.Name__c || '',
                entityBody1: [event.location__c?.line1__c, event.location__c?.city__c]
                                .filter(Boolean)
                                .join(', '),
                entityBody2: `<b>Event Status</b><br />
                                <span style="background:${event.status__c === 'Draft' || event.status__c === 'Published' || event.status__c === 'Ongoing' ? '#38dd3b' : event.status__c === 'Closed' ? '#f53d3d' : '#f5ab3dff'};color:white;padding:4px 8px;border-radius:4px;">
                                    ${event.status__c || ''}
                                </span>`,
                entityBody3: `<b>Event Type</b><br /> ${event.event_Type__c || ''}`,
                entityBody4: `<b>Age Group</b><br /> ${event.age_Group__c || ''}`,
                entityBody5: `<b>Duration(in hours)</b><br /> &#8377;${event.duration_Hours__c || ''}`,
                entityBody6: `<b>Fee Range</b><br /> ${event.fee_Range__c || ''}`,
                entityBody7: `<b>Event Format</b><br /> ${event.format__c || ''}`, 
                entityBody8: `<b>Event Date</b><br /> ${event.event_Date__c || ''}`,
                entityBody9: `<b>Amenities</b><br /> ${event.amenities__c || ''}`,
                entityBody10: `<b>Capacity</b><br /> ${event.capacity__c || ''}`,
                entityBody11: `<b>Related Entity</b><br /> ${event.school__c || ''}`,
                entityBody12: `<b>Event Start Time</b><br /> ${event.event_Start_Time__c || ''}`,
                entityBody13: `<b>Event End Time</b><br /> ${event.event_End_Time__c || ''}`,
                entityDescription: event.description__c || '',
                hasLocationIcon: true,
                image: images,
            };
        })
    };
    return responseWrapper;
};

module.exports = {
    fetchEventContent,
    fetchFeaturedEventContent
}