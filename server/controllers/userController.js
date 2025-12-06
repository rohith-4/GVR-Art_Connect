import Seller from '../models/sellerModel.js';
import Buyer from '../models/buyerModel.js';
import userModel from '../models/userModel.js';
import Product from '../models/prModel.js';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// helper to get normalized userId
const getNormalizedUserId = (req) => {
  // userAuth may set req.user._id or req.user.id or entire token payload
  const u = req.user || {};
  return u.id || u._id || u.userId || null;
};

// helper to upload buffer (multer memory) or remote url to Cloudinary
const uploadToCloudinary = async ({ fileBuffer, remoteUrl, folder = 'art_app' }) => {
  if (fileBuffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      });
      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
  if (remoteUrl) {
    const result = await cloudinary.uploader.upload(remoteUrl, { folder });
    return result.secure_url;
  }
  return null;
};

export const getUserData = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    console.log('getUserData req.user =>', req.user);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    const user = await userModel.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({
      success: true,
      userData: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isverify: user.isverify,
      },
    });
  } catch (error) {
    console.error('getUserData error', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET seller profile (populated with products)
export const getSellerProfile = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    // populate products arrays so client can show details
    let seller = await Seller.findOne({ userId })
      .populate('productsAdded')
      .populate('productsOrdered')
      .populate('productsLiked')
      .lean();

    if (!seller) {
      const user = await userModel.findById(userId).lean();
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user.role !== 'seller') return res.status(404).json({ success: false, message: 'Seller profile not found' });

      const created = await Seller.create({
        userId: new mongoose.Types.ObjectId(userId),
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || '',
        categories: [],
        productsAdded: [],
        productsOrdered: [],
        productsLiked: [],
      });
      return res.json({ success: true, seller: (await Seller.findById(created._id).populate('productsAdded productsOrdered productsLiked').lean()) });
    }

    return res.json({ success: true, seller });
  } catch (error) {
    console.error('getSellerProfile error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST add a product (seller only)
export const addSellerProduct = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    const user = await userModel.findById(userId).lean();
    if (!user || user.role !== 'seller') return res.status(403).json({ success: false, message: 'Only sellers can add products' });

    const { title, description, price, category, imageUrl } = req.body;
    if (!title || !price) return res.status(400).json({ success: false, message: 'title and price are required' });

    // handle file upload (multer puts file buffer in req.file.buffer) or remote URL
    let uploadedUrl = null;
    if (req.file && req.file.buffer) {
      uploadedUrl = await uploadToCloudinary({ fileBuffer: req.file.buffer, folder: 'products' });
    } else if (imageUrl) {
      uploadedUrl = await uploadToCloudinary({ remoteUrl: imageUrl, folder: 'products' });
    }

    const product = await Product.create({
      title,
      description: description || '',
      price,
      category: category || '',
      imageUrl: uploadedUrl || '',
      seller: new mongoose.Types.ObjectId(userId),
    });

    // add to seller.productsAdded
    await Seller.findOneAndUpdate({ userId }, { $push: { productsAdded: product._id } });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('addSellerProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET buyer profile (populated with products)
export const getBuyerProfile = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    let buyer = await Buyer.findOne({ userId })
      .populate('productsOrdered')
      .populate('productsLiked')
      .lean();

    if (!buyer) {
      const user = await userModel.findById(userId).lean();
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (user.role !== 'buyer') return res.status(404).json({ success: false, message: 'Buyer profile not found' });

      const created = await Buyer.create({
        userId: new mongoose.Types.ObjectId(userId),
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || '',
        artworksInterested: [],
        productsOrdered: [],
        productsLiked: [],
      });
      return res.json({ success: true, buyer: (await Buyer.findById(created._id).populate('productsOrdered productsLiked').lean()) });
    }

    return res.json({ success: true, buyer });
  } catch (error) {
    console.error('getBuyerProfile error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH seller profile (update name,email,profilePic,categories)
export const updateSellerProfile = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { name, email, categories } = req.body;
    let profilePicUrl = req.body.profilePic;

    if (req.file && req.file.buffer) {
      profilePicUrl = await uploadToCloudinary({ fileBuffer: req.file.buffer, folder: 'profiles' });
    } else if (profilePicUrl) {
      profilePicUrl = await uploadToCloudinary({ remoteUrl: profilePicUrl, folder: 'profiles' });
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (profilePicUrl !== undefined) update.profilePic = profilePicUrl;
    
    // parse categories if it's a JSON string, otherwise use as-is
    if (categories !== undefined) {
      try {
        update.categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (e) {
        update.categories = Array.isArray(categories) ? categories : [];
      }
    }

    const seller = await Seller.findOneAndUpdate({ userId }, update, { new: true, runValidators: true });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found' });
    }

    await userModel.findByIdAndUpdate(userId, { ...(name ? { name } : {}), ...(email ? { email } : {}), ...(profilePicUrl ? { profilePic: profilePicUrl } : {}) });

    return res.json({ success: true, seller });
  } catch (error) {
    console.error('updateSellerProfile error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH buyer profile (update name,email,profilePic,artworksInterested,productsLiked,productsOrdered)
export const updateBuyerProfile = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { name, email, artworksInterested } = req.body;
    let profilePicUrl = req.body.profilePic;

    if (req.file && req.file.buffer) {
      profilePicUrl = await uploadToCloudinary({ fileBuffer: req.file.buffer, folder: 'profiles' });
    } else if (profilePicUrl) {
      profilePicUrl = await uploadToCloudinary({ remoteUrl: profilePicUrl, folder: 'profiles' });
    }

    const update = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (profilePicUrl !== undefined) update.profilePic = profilePicUrl;
    
    // parse artworksInterested if it's a JSON string
    if (artworksInterested !== undefined) {
      try {
        update.artworksInterested = typeof artworksInterested === 'string' ? JSON.parse(artworksInterested) : artworksInterested;
      } catch (e) {
        update.artworksInterested = Array.isArray(artworksInterested) ? artworksInterested : [];
      }
    }

    const buyer = await Buyer.findOneAndUpdate({ userId }, update, { new: true, runValidators: true });
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer profile not found' });
    }

    await userModel.findByIdAndUpdate(userId, { ...(name ? { name } : {}), ...(email ? { email } : {}), ...(profilePicUrl ? { profilePic: profilePicUrl } : {}) });

    return res.json({ success: true, buyer });
  } catch (error) {
    console.error('updateBuyerProfile error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    // remove sensitive fields if needed
    const user = { ...req.user };
    delete user.password;
    return res.json({ success: true, user });
  } catch (err) {
    console.error('getMe error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/user/seller/products/:productId
export const deleteSellerProduct = async (req, res) => {
  try {
    const userId = getNormalizedUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { productId } = req.params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product id' });
    }

    const ownerId = new mongoose.Types.ObjectId(userId);
    // findOneAndDelete ensures product exists AND belongs to this seller
    const deletedProduct = await Product.findOneAndDelete({ _id: new mongoose.Types.ObjectId(productId), seller: ownerId }).lean();

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found or not owned by you' });
    }

    // remove reference from the seller document (match userId field as ObjectId)
    await Seller.findOneAndUpdate({ userId: ownerId }, { $pull: { productsAdded: deletedProduct._id } });

    // remove references from buyers
    await Buyer.updateMany(
      {},
      { $pull: { productsLiked: deletedProduct._id, productsOrdered: deletedProduct._id } }
    );

    return res.json({ success: true, productId: String(deletedProduct._id) });
  } catch (error) {
    console.error('deleteSellerProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const fetchProfile = async (sellerFlag) => {
  // ...existing code...
  console.log('Fetched profile:', doc);
  setCategories(doc.categories || []);
  // ...
};