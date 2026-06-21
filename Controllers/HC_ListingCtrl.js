const Event = require('../Models/Event.js');
const School = require('../Models/School.js');
const Content = require('../Models/Content.js');
const mongoose = require('mongoose');

const fetchPartnerListings = async (req, res) => {
    try {

        const { ownerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return res.status(400).json({
                error: 'Invalid owner id'
            });
        }

        const events = await Event.find({
            owner__c: ownerId
        })
        .populate('location__c')
        .sort({ createdAt: -1 })
        .lean();

        const eventIds = events.map(
            ev => ev._id
        );

        const contents = await Content.find({
            related_To_Id__c: {
                $in: eventIds
            },
            related_Type__c: 'HC_Event',
            type__c: 'Image'
        }).lean();
        const response = getListingResponseWrapper(events,contents);
        return res.status(200).json(response);
    } catch (error) {
        console.error(
            'fetchPartnerListings error:',
            error
        );
        return res.status(500).json({
            error: error.message
        });
    }
};

const getListingResponseWrapper = (events,contents) => {
    const imageContentMap = {};
    for (const cont of contents) {
        const code = cont.related_To_Code__c;
        if (!code) continue;
        if (!imageContentMap[code]) {
            imageContentMap[code] = [];
        }
        imageContentMap[code].push({
            hcContentImageId: cont._id,
            imageURL:
                cont.image_URL__c,
            isPrimary:
                cont.primary_Image__c
        });
    }

    return {
        listings: events.map(
            event => {
                const images = imageContentMap[event.event_Code__c] || [];
                return {
                    listingId: event._id,
                    listingType: 'HC_Event',
                    listingCode: event.event_Code__c,
                    listingName: event.Name__c,
                    listingStatus: event.status__c,
                    active: event.active__c,
                    description: event.description__c,
                    location: [
                                event.location__c?.line1__c,
                                event.location__c?.city__c
                              ].filter(Boolean).join(', '),
                    createdAt: event.createdAt,
                    image: images
                };
            }
        )
    };
};
const getListingDetail = async(req,res) => {
    try {
        const { listingType, listingId } = req.params;
        if(!mongoose.Types.ObjectId.isValid(listingId)) {
            return res.status(400).json({
                error: 'Invalid listing id'
            });
        }
        let listing = null;
        switch (listingType?.toUpperCase()) {
            case "HC_EVENT":
                listing = await Event.findById(listingId).populate('location__c').lean();
                break;
            case "HC_SCHOOL":
                listing = await School.findById(listingId).populate('location__c').lean();
                break;
            /* case "HC_INSTITUTE":
                listing = await Institute.findById(listingId).populate('location__c').lean();
                break;
            case "HC_TUTOR":
                listing = await Tutor.findById(listingId).populate('location__c').lean();
                break; */
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid listing type"
                });
        }
        if(!listing){
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }
        const contents = await Content.find({
            related_To_Id__c: {
                $in: listingId
            },
            related_Type__c: listingType,
            type__c: 'Image'
        }).lean();
        const response = getListingResponseWrapper([listing],contents);
        console.log('cch>',response);
        return res.status(200).json(response);
    }catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

module.exports = {
    fetchPartnerListings,
    getListingDetail
}