const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null,true);
    } else{
        cb(new Error('Only image files are allowed.'),false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2*1024*1024
    },
    fileFilter: fileFilter
});

module.exports = upload;