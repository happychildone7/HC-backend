require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const hcAuthRouter = require('./Routes/HC_Authentication.js');
const hcSigupRouter = require('./Routes/HC_Signup.js');
const hcContactRouter = require('./Routes/HC_Contact.js');
const hcUserRouter = require('./Routes/HC_User.js');
const hcLocationRouter = require('./Routes/HC_Location.js');
const hcContentRouter = require('./Routes/HC_Content.js');
const hcSchoolRouter = require('./Routes/HC_School.js');
const hcEventRouter = require('./Routes/HC_Event.js');
const hcRegistrationRouter = require('./Routes/HC_Registration.js');
const hcPromotionRouter = require('./Routes/HC_Promotion.js');
const hcWishlistRouter = require('./Routes/HC_Wishlist.js');
const hcListingRouter = require('./Routes/HC_Listing.js');
const hcPaymentRouter = require('./Routes/HC_Payment.js');
const hcSchoolContentRouter = require('./Routes/HC_SchoolContent.js');
const hcEventContentRouter = require('./Routes/HC_EventContent.js');
const hcCountryRouter = require('./Routes/HC_Country.js');
const hcStateRouter = require('./Routes/HC_State.js');
const hcCityRouter = require('./Routes/HC_City.js');
const hcFileUploadRouter = require('./Routes/HC_FileUpload.js');
const mongoose = require('mongoose');

const allowedOrigins = [
    'http://localhost:3000',
    'https://happychild.co.in',
    'https://www.happychild.co.in'
];


const app = express();

const port = process.env.PORT;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        const server = app.listen(port,() => {
            console.log('COnnected to db and Yo listen!!',port);
        });

        process.on('SIGINT', () => {
            console.log('Received SIGINT. Shutting down gracefully.');
            server.close(() => {
              console.log('Server closed');
              process.exit(0);
            });
        });
    })
    .catch((error) => {
        console.log('MONGO COnnect error>',error);
    })

//use cookie-parser before routes
app.use(cookieParser());

//Use express.json to parse JSON bodies
app.use(express.json());

//Configure CORS for frontend domain (important!)
app.use(cors({
    origin: function(origin, callback) {

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error('Not allowed by CORS')
        );
    },
    credentials: true
}));

app.use((req,res,next) => {
    console.log('server called',req.path,req.method);
    next();
});

app.use('/api/signup',hcSigupRouter);
app.use('/api/auth',hcAuthRouter);
app.use('/api/contact',hcContactRouter);
app.use('/api/user',hcUserRouter);
app.use('/api/location',hcLocationRouter);
app.use('/api/content',hcContentRouter);
app.use('/api/school',hcSchoolRouter);
app.use('/api/event',hcEventRouter);
app.use('/api/registration',hcRegistrationRouter);
app.use('/api/promotion',hcPromotionRouter);
app.use('/api/wishlist',hcWishlistRouter);
app.use('/api/listing',hcListingRouter);
app.use('/api/payment',hcPaymentRouter);
app.use('/api/schoolContent',hcSchoolContentRouter);
app.use('/api/eventContent',hcEventContentRouter);
app.use('/api/country',hcCountryRouter);
app.use('/api/state',hcStateRouter);
app.use('/api/city',hcCityRouter);
app.use('/api/fileUpload',hcFileUploadRouter);




