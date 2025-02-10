import trycatch from '../utils/try-catch.js';
import getDataUrl  from '../utils/urlgenerator.js';
import cloudinary from 'cloudinary';
import {Pin} from '../models/pinModel.js';

export const createPin=trycatch(async (req,res)=>{
    const {title,pin} = req.body;
    const file=req.file;
    const fileUrl=getDataUrl(file);
    const cloud=await cloudinary.v2.uploader.upload(fileUrl.content);
    await Pin.create({
        title,
        pin,
        image:{
            id:cloud.public_id,
            url:cloud.secure_url
        },
        owner:req.user._id
    });
    res.status(201).json({message:'Pin created successfully'});
});


export const getAllPins=trycatch(async (req,res)=>{
    const pins=await Pin.find().sort({createdAt:-1});
    res.status(200).json({pins});
})

export const getSinglePin=trycatch(async(req,res)=>{
    const pinId=req.params.id;
    const find=await Pin.findById(pinId).populate('owner',"-password");
    res.status(200).json({find});
})