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
        applicableProducts,
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
        if (typeof applicableProducts === 'string') {
          productIds = JSON.parse(applicableProducts);
        } else {
          productIds = applicableProducts;
        }

        productIds = Array.isArray(productIds)
          ? productIds
          : [productIds].filter(Boolean);

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

      // Verify all product IDs exist and get their prices
      const products = await Product.find({ _id: { $in: productIds } })
        .select('sellers');
      
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: 'One or more product IDs are invalid' });
      }

      // Calculate new prices for each product and include promotion image
      const promotionReferences = products.map(product => {
        const seller = product.sellers.find(s => s.sellerId.toString() === sellerId);
        if (!seller) {
          throw new Error(`Seller ${sellerId} not found for product ${product._id}`);
        }
        const oldPrice = seller.price;
        const newPrice = oldPrice * (1 - discountRate / 100);
        return {
          productId: product._id,
          promotionRef: {
            promotionId: null, // Will be set after promotion creation
            isActive: true,
            oldPrice,
            newPrice,
            image: null // Will be set after image upload
          }
        };
      });

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
        createdBy: sellerId,
      });

      // Save promotion
      await promotion.save();

      // Update promotion references with the new promotion ID and image
      const updatePromises = promotionReferences.map(({ productId, promotionRef }) => {
        promotionRef.promotionId = promotion._id;
        promotionRef.image = {
          url: result.secure_url,
          publicId: result.public_id
        };
        return Product.updateOne(
          { 
            _id: productId,
            "sellers.sellerId": sellerId 
          },
          { 
            $push: { 
              "sellers.$.promotions": promotionRef 
            },
            $set: {
              "sellers.$.activePromotion": promotion._id
            }
          }
        );
      });

      // Execute all product updates
      await Promise.all(updatePromises);

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

const getPromotionById = async (req, res) => {
  try {
    const { promotionId } = req.params;

    // Validate promotionId
    if (!mongoose.isValidObjectId(promotionId)) {
      return res.status(400).json({ message: 'Invalid promotion ID' });
    }

    // Find promotion with populated product details
    const promotion = await Promotion.findById(promotionId)
      .populate({
        path: 'applicableProducts',
        select: 'name price reference images description categoryDetails sellers',
        populate: [
          { path: 'categoryDetails.category', select: 'name' },
          { 
            path: 'sellers.sellerId', 
            select: 'name email' 
          }
        ],
      })
      .populate('createdBy', 'name email');

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.status(200).json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPromotion,
  getUserPromotions,
  getPromotionById,
};