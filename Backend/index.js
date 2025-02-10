import express from 'express';
import dotenv from 'dotenv';
import connectDb from './database/db.js';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
dotenv.config();
cloudinary.v2.config({
    cloud_name:process.env.cloud_name,
    api_key:process.env.cloud_Api,
    api_secret:process.env.cloud_Secret
})

const app = express();
const port=process.env.PORT;


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());


//import routes
import userRoutes from './routes/userRoutes.js';
import pinroutes from './routes/pinRoutes.js';


//using routes
app.use('/api/users', userRoutes);
app.use('/api/pin', pinroutes);

app.listen(port, () => {
    connectDb();
    console.log('Server is running on port 3000');
});