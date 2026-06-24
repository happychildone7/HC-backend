const HC_Analytics = require('../Models/Analytics');

const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const incrementMetric = async (
    entityType,
    entityId,
    metric
) => {
    console.log('ccc<sd',entityId,entityType,metric);
    const today = getToday();
    try{
        const result = await HC_Analytics.findOneAndUpdate(
            {
                entity_Type__c: entityType,
                entity_Id__c: entityId,
                analytics_Date__c: today
            },
            {
                $inc: {
                    [metric]: 1
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
        console.log('analytics result', result);
    }catch(err){
        console.log('analytics err', err);
    }
};

const getAnalyticsSummary = async (
    entityType,
    entityIds
) => {

    const analytics = await HC_Analytics.aggregate([
        {
            $match: {
                entity_Type__c: entityType,
                entity_Id__c: {
                    $in: entityIds
                }
            }
        },
        {
            $group: {
                _id: '$entity_Id__c',

                impressions: {
                    $sum: '$impressions__c'
                },

                clicks: {
                    $sum: '$clicks__c'
                },

                views: {
                    $sum: '$views__c'
                },

                saves: {
                    $sum: '$saves__c'
                },

                enquiries: {
                    $sum: '$enquiries__c'
                },

                bookings: {
                    $sum: '$bookings__c'
                }
            }
        }
    ]);

    return analytics.reduce((map, row) => {

        map[row._id.toString()] = row;

        return map;

    }, {});
};

module.exports = {
    incrementMetric,
    getAnalyticsSummary
};