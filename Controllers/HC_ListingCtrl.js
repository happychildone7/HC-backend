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

        const schools = await School.find({
            owner__c: ownerId
        })
        .populate('location__c')
        .sort({ createdAt: -1 })
        .lean();

        const items = [
            ...events.map(event => ({
                ...event,
                entityType: 'HC_Event'
            })),
            ...schools.map(school => ({
                ...school,
                entityType: 'HC_School'
            }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const relatedToIds = [
            ...events.map(ev => ev._id),
            ...schools.map(sc => sc._id)
        ];

        const contents = await Content.find({
            related_To_Id__c: {
                $in: relatedToIds
            },
            type__c: 'Image'
        }).lean();
        const response = getListingResponseWrapper(items,contents);
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

const getListingResponseWrapper = (items,contents) => {
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
        listings: items.map(
            item => {
                const listingCode = item.entityType === 'HC_School' ? item.school_Code__c : item.event_Code__c;
                const images = imageContentMap[listingCode] || [];
                return {
                    listingId: item._id,
                    listingType: item.entityType,
                    listingCode,
                    listingName: item.Name__c,
                    listingStatus: item.status__c,
                    active: item.active__c,
                    description: item.description__c,
                    location: [
                                item.location__c?.line1__c,
                                item.location__c?.city__c
                              ].filter(Boolean).join(', '),
                    createdAt: item.createdAt,
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
        let entityType = null;
        switch (listingType?.toUpperCase()) {
            case "HC_EVENT":
                listing = await Event.findById(listingId).populate('location__c').lean();
                entityType = 'HC_Event';
                break;
            case "HC_SCHOOL":
                listing = await School.findById(listingId).populate('location__c').lean();
                entityType = 'HC_School';
                break;
            /* case "HC_INSTITUTE":
                listing = await Institute.findById(listingId).populate('location__c').lean();
                entityType = 'HC_Institute';
                break;
            case "HC_TUTOR":
                listing = await Tutor.findById(listingId).populate('location__c').lean();
                entityType = 'HC_Tutor';
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
        listing.entityType = entityType;
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