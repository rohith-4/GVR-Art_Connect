import express from 'express';
import userAuth from '../middleware/userAuth.js';
import multer from 'multer';
import {
  getUserData,
  getSellerProfile,
  getBuyerProfile,
  updateSellerProfile,
  updateBuyerProfile,
  addSellerProduct,
  deleteSellerProduct,
} from '../controllers/userController.js';

const userRouter = express.Router();

// multer memory storage so we can stream buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

userRouter.get('/data', userAuth, getUserData);

// profile endpoints
userRouter.get('/seller', userAuth, getSellerProfile);
userRouter.get('/buyer', userAuth, getBuyerProfile);

// update profile: accept optional profileImage file
userRouter.patch('/seller', userAuth, upload.single('profileImage'), updateSellerProfile);
userRouter.patch('/buyer', userAuth, upload.single('profileImage'), updateBuyerProfile);

// seller product management
userRouter.post('/seller/products', userAuth, upload.single('image'), addSellerProduct);
userRouter.delete('/seller/products/:productId', userAuth, deleteSellerProduct);

export default userRouter;