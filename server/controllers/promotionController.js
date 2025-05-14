const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer for single image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
  },
}).single('image');

const createPromotion = async (req, res) => {
  try {
    // Handle single image upload with Multer
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const {
        name,
        discountRate,
        startDate,
        endDate,
        applicableProducts,// Expecting a JSON string or single product ID
        sellerId 
      } = req.body;

      // Validate required fields
      if (!name || !discountRate || !startDate || !endDate || !req.file || !sellerId) {
        return res.status(400).json({ message: 'All fields and an image are required' });
      }
      if (!mongoose.isValidObjectId(sellerId)) {
        return res.status(400).json({ message: 'Invalid seller ID' });
      }

      // Validate discountRate
      if (discountRate < 0 || discountRate > 100) {
        return res.status(400).json({ message: 'Discount rate must be between 0 and 100' });
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      // Parse and validate applicable products
      let productIds;
      try {
        // If applicableProducts is a JSON string, parse it
        if (typeof applicableProducts === 'string') {
          productIds = JSON.parse(applicableProducts);
        } else {
          productIds = applicableProducts;
        }

        // Ensure productIds is an array
        productIds = Array.isArray(productIds)
          ? productIds
          : [productIds].filter(Boolean);

        // Validate each product ID
        productIds = productIds.map((id) => id.toString());
        const invalidIds = productIds.filter((id) => !mongoose.isValidObjectId(id));
        if (invalidIds.length > 0) {
          return res.status(400).json({
            message: `Invalid product IDs: ${invalidIds.join(', ')}`,
          });
        }
      } catch (error) {
        return res.status(400).json({ message: 'Invalid applicableProducts format' });
      }

      if (productIds.length === 0) {
        return res.status(400).json({ message: 'At least one applicable product is required' });
      }

      // Verify all product IDs exist
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'One or more product IDs are invalid' });
      }

      // Upload image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'promotions' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      // Create new promotion
      const promotion = new Promotion({
        name,
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
        discountRate,
        startDate: start,
        endDate: end,
        applicableProducts: productIds,
        createdBy: sellerId, // Placeholder user ID (no auth)
      });

      // Save promotion
      await promotion.save();

      // Update all applicable products with the new promotion
      const promotionRef = {
        promotionId: promotion._id,
        isActive: true
      };

      // Update each product's sellers to include the promotion
      await Product.updateMany(
        { _id: { $in: productIds } },
        { 
          $push: { 
            "sellers.$[].promotions": promotionRef 
          },
          $set: {
            "sellers.$[].activePromotion": promotion._id
          }
        }
      );

      res.status(201).json({ message: 'Promotion created successfully', promotion });
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    
    // If promotion was created but product update failed, try to clean up
    if (promotion) {
      try {
        await Promotion.deleteOne({ _id: promotion._id });
        await cloudinary.uploader.destroy(promotion.image.publicId);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};
const getUserPromotions = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const promotions = await Promotion.find({ createdBy: userId })
      .populate({
        path: 'applicableProducts',
        select: 'name price reference images categoryDetails sellers',
        populate: [
          { path: 'categoryDetails.category', select: 'name' },
          { path: 'sellers.sellerId', select: 'name email' },
        ],
      })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPromotion,
  getUserPromotions,
};