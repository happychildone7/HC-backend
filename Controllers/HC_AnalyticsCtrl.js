const analyticsService = require('../services/AnalyticsService.js');

const trackMetric = async(req,res) => {
    try{
        const{
            entityType,
            entityId,
            metric
        } = req.body;
        await analyticsService.incrementMetric(
            entityType,
            entityId,
            metric
        );

        return res.status(200).json({
            success: true
        });
    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = {
    trackMetric
}