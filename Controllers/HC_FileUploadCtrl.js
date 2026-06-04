const cloudinary = require('../configurations/cloudinary.js');
const { deleteCloudinaryImages } = require('../utils/cloudinaryHelper.js');

const fileUpload = async (req,res) => {
    try{
        if(!req.files || req.files.length === 0){
            return res.status(400).json({ error: 'No files uploaded.' });
        }
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve,reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'happy-child/content',
                        resource_type: 'auto'
                    },
                    (error,result) => {
                        if(error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
        });
        const uploadResults = await Promise.all(uploadPromises);
        const imageUrls = uploadResults.map(result => result.secure_url);
        const publicIds = uploadResults.map(result => result.public_id);
        res.json({ success: true, imageUrls: imageUrls, publicIds: publicIds, count: uploadResults.length });
    }catch(error){
        console.log('error in upload:',error);
        res.status(500).json({ error: error.message });
    }
};
const cleanUp = async (req,res) => {
    try{
        const { publicIds = [] } = req.body;
        const deleteStats = await deleteCloudinaryImages(publicIds);
        return res.status(200).json({ deleted: deleteStats.deleted, results: deleteStats.results });
    }catch(error){
        console.log('error in cleanup:',error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    fileUpload,
    cleanUp
};