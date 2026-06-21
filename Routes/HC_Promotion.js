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
    getPromotionsByOwner
} = require('../Controllers/HC_PromotionCtrl.js');

const router = express.Router();

router.get('/search/',searchPromotions);
router.get('/:id',getSinglePromotion);
router.get('/',getAllPromotions);
router.post('/',createPromotion);
router.patch('/:id',updatePromotion);
router.delete('/:id',deletePromotion);
router.post('/deleteMany',deleteMultiplePromotion);
router.post('/bulkActivate',activatePromotions);
router.post('/bulkDeactivate',deactivatePromotions);
router.get('/myPromotions/:ownerId',getPromotionsByOwner);

module.exports = router;