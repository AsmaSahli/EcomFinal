const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');

// Get all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'reference name')
      .lean();

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid promotion ID' });
    }

    const promotion = await Promotion.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'reference name')
      .lean();

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Create new promotion
exports.createPromotion = async (req, res) => {
  try {
    const { name, description, discountRate, startDate, endDate, applicableProducts, createdBy } = req.body;

    // Validate required fields
    if (!name || !description || discountRate === undefined || !startDate || !endDate || !createdBy) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Validate ObjectId for createdBy
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ error: 'Invalid createdBy ID' });
    }

    // Validate discountRate
    if (discountRate < 0 || discountRate > 100) {
      return res.status(400).json({ error: 'Discount rate must be between 0 and 100' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (end <= start) {
      return res.status(400).json({ error: 'endDate must be after startDate' });
    }

    // Validate applicableProducts
    const productIds = Array.isArray(applicableProducts) ? applicableProducts : [];
    if (productIds.length > 0) {
      for (const productId of productIds) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ error: `Invalid product ID: ${productId}` });
        }
      }
      // Verify products exist
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ error: 'One or more products not found' });
      }
    }

    const promotionData = {
      name,
      description,
      discountRate,
      startDate: start,
      endDate: end,
      applicableProducts: productIds,
      createdBy
    };

    const promotion = await Promotion.create(promotionData);

    // Update products to include this promotion in their sellers' promotions array
    if (productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        {
          $push: {
            'sellers.$[].promotions': {
              promotionId: promotion._id,
              isActive: start <= new Date() && new Date() <= end
            }
          }
        }
      );
    }

    const populatedPromotion = await Promotion.findById(promotion._id)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'reference name');

    res.status(201).json(populatedPromotion);
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.errors });
  }
};

// Update promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid promotion ID' });
    }

    const updateData = { ...req.body };

    // Prevent updating createdBy
    delete updateData.createdBy;

    // Validate discountRate if provided
    if (updateData.discountRate !== undefined) {
      if (updateData.discountRate < 0 || updateData.discountRate > 100) {
        return res.status(400).json({ error: 'Discount rate must be between 0 and 100' });
      }
    }

    // Validate dates if provided
    if (updateData.startDate || updateData.endDate) {
      const start = new Date(updateData.startDate || (await Promotion.findById(id)).startDate);
      const end = new Date(updateData.endDate || (await Promotion.findById(id)).endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      if (end <= start) {
        return res.status(400).json({ error: 'endDate must be after startDate' });
      }
      updateData.startDate = start;
      updateData.endDate = end;
    }

    // Validate applicableProducts if provided
    if (updateData.applicableProducts) {
      const productIds = Array.isArray(updateData.applicableProducts) ? updateData.applicableProducts : [];
      for (const productId of productIds) {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ error: `Invalid product ID: ${productId}` });
        }
      }
      const products = await Product.find({ _id: { $in: productIds } });
      if (products.length !== productIds.length) {
        return res.status(400).json({ error: 'One or more products not found' });
      }
    }

    const promotion = await Promotion.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Update isActive status in products if dates changed
    if (updateData.startDate || updateData.endDate) {
      const now = new Date();
      const isActive = promotion.startDate <= now && now <= promotion.endDate;
      await Product.updateMany(
        { 'sellers.promotions.promotionId': promotion._id },
        {
          $set: {
            'sellers.$[].promotions.$[promo].isActive': isActive
          }
        },
        {
          arrayFilters: [{ 'promo.promotionId': promotion._id }]
        }
      );
    }

    // Update applicableProducts in products if changed
    if (updateData.applicableProducts) {
      // Remove promotion from products no longer applicable
      await Product.updateMany(
        {
          _id: { $nin: updateData.applicableProducts },
          'sellers.promotions.promotionId': promotion._id
        },
        {
          $pull: {
            'sellers.$[].promotions': { promotionId: promotion._id }
          }
        }
      );

      // Add promotion to new applicable products
      await Product.updateMany(
        {
          _id: { $in: updateData.applicableProducts },
          'sellers.promotions.promotionId': { $ne: promotion._id }
        },
        {
          $push: {
            'sellers.$[].promotions': {
              promotionId: promotion._id,
              isActive: promotion.startDate <= new Date() && new Date() <= promotion.endDate
            }
          }
        }
      );
    }

    const populatedPromotion = await Promotion.findById(promotion._id)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'reference name');

    res.status(200).json(populatedPromotion);
  } catch (error) {
    res.status(400).json({ error: error.message, details: error.errors });
  }
};

// Delete promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid promotion ID' });
    }

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Remove promotion references from products
    await Product.updateMany(
      { 'sellers.promotions.promotionId': id },
      {
        $pull: {
          'sellers.$[].promotions': { promotionId: id }
        }
      }
    );

    // Clear activePromotion if it references this promotion
    await Product.updateMany(
      { 'sellers.activePromotion': id },
      {
        $unset: { 'sellers.$[].activePromotion': '' }
      }
    );

    await promotion.remove();

    res.status(200).json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Search promotions by name or applicable product reference
exports.searchPromotions = async (req, res) => {
  try {
    const { query, productReference } = req.query;

    // If searching by product reference
    if (productReference) {
      const product = await Product.findOne({ reference: productReference });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const promotions = await Promotion.find({
        applicableProducts: product._id
      })
        .populate('createdBy', 'name email')
        .populate('applicableProducts', 'reference name')
        .lean();
      return res.status(200).json(promotions);
    }

    // Traditional search
    if (!query || query.length < 3) {
      return res.status(400).json({
        error: 'Search query must be at least 3 characters long'
      });
    }

    const promotions = await Promotion.find({
      name: { $regex: query, $options: 'i' }
    })
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'reference name')
      .limit(10)
      .lean();

    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Set active promotion for a seller's product
exports.setActivePromotion = async (req, res) => {
  try {
    const { productId, sellerId, promotionId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(promotionId)) {
      return res.status(400).json({ error: 'Invalid promotion ID' });
    }

    // Find product and promotion
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Verify promotion is applicable to this product
    if (!promotion.applicableProducts.includes(productId)) {
      return res.status(400).json({ error: 'Promotion not applicable to this product' });
    }

    // Find seller's entry
    const sellerIndex = product.sellers.findIndex(s => s.sellerId.toString() === sellerId);
    if (sellerIndex === -1) {
      return res.status(404).json({ message: 'Seller not found for this product' });
    }

    // Verify promotion exists in seller's promotions
    const promotionEntry = product.sellers[sellerIndex].promotions.find(
      p => p.promotionId.toString() === promotionId
    );
    if (!promotionEntry) {
      return res.status(400).json({ error: 'Promotion not assigned to this seller' });
    }

    // Update isActive for all promotions
    product.sellers[sellerIndex].promotions = product.sellers[sellerIndex].promotions.map(p => ({
      ...p.toObject(),
      isActive: p.promotionId.toString() === promotionId
    }));

    // Set activePromotion
    product.sellers[sellerIndex].activePromotion = promotionId;

    await product.save();

    const updatedProduct = await Product.findById(productId)
      .populate('sellers.sellerId', 'name email')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion')
      .populate('category', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get active promotions for a seller's product
exports.getActivePromotions = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const product = await Product.findById(productId)
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const seller = product.sellers.find(s => s.sellerId.toString() === sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found for this product' });
    }

    const activePromotions = seller.promotions.filter(p => p.isActive).map(p => p.promotionId);
    if (seller.activePromotion) {
      activePromotions.push(seller.activePromotion);
    }

    const uniquePromotions = [...new Set(activePromotions.map(p => p._id.toString()))].map(id =>
      activePromotions.find(p => p._id.toString() === id)
    );

    res.status(200).json(uniquePromotions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};