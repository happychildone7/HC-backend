const express = require('express');
const {
    searchPromotions,
    getSinglePromotion,
    getAllPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    deleteMultiplePromotion,
    activatePromotions,
    deactivatePromotions,
    getPromotionsByOwner,
    getFeaturedPromotions
} = require('../Controllers/HC_PromotionCtrl.js');

const router = express.Router();

router.get('/search/',searchPromotions);
router.get('/featured',getFeaturedPromotions);
router.get('/myPromotions/:ownerId',getPromotionsByOwner);
router.get('/:id',getSinglePromotion);
router.get('/',getAllPromotions);
router.post('/',createPromotion);
router.patch('/:id',updatePromotion);
router.delete('/:id',deletePromotion);
router.post('/deleteMany',deleteMultiplePromotion);
router.post('/bulkActivate',activatePromotions);
router.post('/bulkDeactivate',deactivatePromotions);

module.exports = router;