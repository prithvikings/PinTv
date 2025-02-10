import express from 'express';
import uploadFile from "../middleware/multer.js";
import {isAuth} from "../middleware/isAuth.js";
import { createPin, getAllPins, getSinglePin } from "../controller/pinController.js";


const router = express.Router();


router.post("/new",isAuth,uploadFile,createPin);
router.get("/all",isAuth,getAllPins);
router.get("/:id",isAuth,getSinglePin);

export default router;