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


export const commentOnpin=trycatch(async(req,res)=>{
    const pinId=req.params.id;
    const pin=await Pin.findById(pinId);
    if(!pin){
        res.status(404);
        throw new Error('Pin not found');
    }

    pin.comments.push({
        user:req.user._id,
        name:req.user.name,
        comment:req.body.comment
    });
    await pin.save();
    res.status(201).json({message:'Comment added successfully'});
})


export const deleteComment = trycatch(async (req, res) => {
    const pin = await Pin.findById(req.params.id);
  
    if (!pin)
      return res.status(400).json({
        message: "No Pin with this id",
      });
  
    if (!req.query.commentId)
      return res.status(404).json({
        message: "Please give comment id",
      });
  
    const commentIndex = pin.comments.findIndex(
      (item) => item._id.toString() === req.query.commentId.toString()
    );
  
    if (commentIndex === -1) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }
  
    const comment = pin.comments[commentIndex];
  
    if (comment.user.toString() === req.user._id.toString()) {
      pin.comments.splice(commentIndex, 1);
  
      await pin.save();
  
      return res.json({
        message: "Comment Deleted",
      });
    } else {
      return res.status(403).json({
        message: "You are not owner of this comment",
      });
    }
  });


  export const deletePin = trycatch(async (req, res) => {
    const pin = await Pin.findById(req.params.id);
  
    if (!pin)
      return res.status(400).json({
        message: "No Pin with this id",
      });
  
    if (pin.owner.toString() !== req.user._id.toString())
      return res.status(403).json({
        message: "Unauthorized",
      });
  
    await cloudinary.v2.uploader.destroy(pin.image.id);
  
    await pin.deleteOne();
  
    res.json({
      message: "Pin Deleted",
    });
  });
  
  export const updatePin = trycatch(async (req, res) => {
    const pin = await Pin.findById(req.params.id);
  
    if (!pin)
      return res.status(400).json({
        message: "No Pin with this id",
      });
  
    if (pin.owner.toString() !== req.user._id.toString())
      return res.status(403).json({
        message: "Unauthorized",
      });
  
    pin.title = req.body.title;
    pin.pin = req.body.pin;
  
    await pin.save();
  
    res.json({
      message: "Pin updated",
    });
  });