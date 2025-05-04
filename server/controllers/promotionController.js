const Promotion = require("../models/Promotion");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Create a new promotion
exports.createPromotion = async (req, res) => {
  try {
    const { name, description, discountRate, startDate, endDate, applicableProducts } = req.body;
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    // Validate discount rate
    if (discountRate <= 0 || discountRate > 100) {
      return res.status(400).json({ message: "Discount rate must be between 1 and 100" });
    }

    const promotion = new Promotion({
      name,
      description,
      discountRate,
      startDate,
      endDate,
      applicableProducts: applicableProducts || [],
      createdBy: req.user?._id// Assuming user is attached to request
    });

    await promotion.save();

    // Add promotion to applicable products if specified
    if (applicableProducts && applicableProducts.length > 0) {
      await Product.updateMany(
        { _id: { $in: applicableProducts } },
        { $push: { "sellers.$[].promotions": { promotionId: promotion._id, isActive: false } } }
      );
    }

    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all active promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    
    let query = {};
    if (activeOnly === 'true') {
      query = {
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      };
    }

    const promotions = await Promotion.find(query)
      .populate('applicableProducts', 'name reference images')
      .sort({ startDate: 1 });

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('applicableProducts', 'name reference images')
      .populate('createdBy', 'name email');

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent changing certain fields
    delete updates.createdBy;
    delete updates.applicableProducts;

    const promotion = await Promotion.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true 
    });

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.status(200).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove promotion from all products first
    await Product.updateMany(
      { "sellers.promotions.promotionId": id },
      { $pull: { "sellers.$[].promotions": { promotionId: id } } }
    );

    // Remove as active promotion if set
    await Product.updateMany(
      { "sellers.activePromotion": id },
      { $set: { "sellers.$[].activePromotion": null } }
    );

    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add products to promotion
exports.addProductsToPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    // Validate product IDs
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Product IDs array is required" });
    }

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $addToSet: { applicableProducts: { $each: productIds } } },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    // Add promotion to products
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { "sellers.$[].promotions": { promotionId: id, isActive: false } } }
    );

    res.status(200).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove products from promotion
exports.removeProductsFromPromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $pull: { applicableProducts: { $in: productIds } } },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    // Remove promotion from products
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $pull: { "sellers.$[].promotions": { promotionId: id } } }
    );

    // If any of these products had this as active promotion, remove it
    await Product.updateMany(
      { 
        _id: { $in: productIds },
        "sellers.activePromotion": id 
      },
      { $set: { "sellers.$[].activePromotion": null } }
    );

    res.status(200).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Activate a promotion for a product
exports.activatePromotion = async (req, res) => {
  try {
    const { productId, sellerId, promotionId } = req.body;
    
    // 1. Verify the promotion exists and is valid
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    // Check if promotion is active
    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({ message: "Promotion is not currently active" });
    }

    // 2. Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Find the seller in the product
    const sellerIndex = product.sellers.findIndex(s => 
      s.sellerId.toString() === sellerId
    );
    if (sellerIndex === -1) {
      return res.status(400).json({ message: "Seller not found for this product" });
    }

    // 4. Check if promotion is applicable to this product
    if (!promotion.applicableProducts.includes(productId)) {
      return res.status(400).json({ message: "Promotion not applicable to this product" });
    }

    // 5. Check if seller has this promotion available
    const hasPromotion = product.sellers[sellerIndex].promotions.some(
      p => p.promotionId.toString() === promotionId
    );
    if (!hasPromotion) {
      return res.status(400).json({ message: "Promotion not available for this seller" });
    }

    // 6. Update the product with the active promotion
    product.sellers[sellerIndex].activePromotion = promotionId;
    
    // Update the isActive flag in the promotions array
    product.sellers[sellerIndex].promotions.forEach(p => {
      p.isActive = (p.promotionId.toString() === promotionId);
    });

    await product.save();

    res.json({
      message: "Promotion activated successfully",
      product: await Product.findById(productId)
        .populate('sellers.activePromotion')
        .populate('sellers.promotions.promotionId')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deactivate promotion for a product
exports.deactivatePromotion = async (req, res) => {
  try {
    const { productId, sellerId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sellerIndex = product.sellers.findIndex(s => 
      s.sellerId.toString() === sellerId
    );
    if (sellerIndex === -1) {
      return res.status(400).json({ message: "Seller not found for this product" });
    }

    // Reset active promotion and isActive flags
    product.sellers[sellerIndex].activePromotion = null;
    product.sellers[sellerIndex].promotions.forEach(p => {
      p.isActive = false;
    });

    await product.save();

    res.json({
      message: "Promotion deactivated successfully",
      product: await Product.findById(productId)
        .populate('sellers.promotions.promotionId')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product promotions
exports.getProductPromotions = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;
    
    // 1. Get all promotions applicable to this product
    const promotions = await Promotion.find({
      applicableProducts: productId,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).select('name description discountRate startDate endDate');

    // 2. Get current active promotion if any
    const product = await Product.findById(productId)
      .select('sellers')
      .populate('sellers.activePromotion', 'name discountRate');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const seller = product.sellers.find(s => s.sellerId.toString() === sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found for this product" });
    }

    // 3. Get all promotions available to this seller
    const sellerPromotions = await Promotion.find({
      _id: { $in: seller.promotions.map(p => p.promotionId) }
    }).select('name description discountRate startDate endDate');

    res.json({
      allApplicablePromotions: promotions,
      sellerAvailablePromotions: sellerPromotions,
      activePromotion: seller.activePromotion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};