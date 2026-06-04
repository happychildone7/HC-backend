const express = require('express');
const {
    searchWishlists,
    getSingleWishlist,
    getAllWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    deleteMultipleWishlist
} = require('../Controllers/HC_WishlistCtrl.js');

const router = express.Router();

router.get('/search/',searchWishlists);
router.get('/:id',getSingleWishlist);
router.get('/',getAllWishlists);
router.post('/',createWishlist);
router.patch('/:id',updateWishlist);
router.delete('/:id',deleteWishlist);
router.post('/deleteMany',deleteMultipleWishlist);

module.exports = router;