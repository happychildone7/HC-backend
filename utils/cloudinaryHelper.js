const cloudinary = require('../configurations/cloudinary.js');

const deleteCloudinaryImages = async (publicIds) => {
    if(!Array.isArray(publicIds) || publicIds.length === 0){
        return { deleted: 0, results: [] };
    }
    const results = await Promise.all(
        publicIds.map(id => cloudinary.uploader.destroy(id))
    );
    return {
        deleted: publicIds.length,
        results
    };
};

module.exports = { deleteCloudinaryImages };