const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, sellerId, quantity, price, variantId } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(sellerId)
    ) {
      return res.status(400).json({ message: 'Invalid product or seller ID' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    // Check if product and seller exist
    const product = await Product.findOne({
      _id: productId,
      'sellers.sellerId': sellerId,
    }).populate('sellers.promotions.promotionId');
    if (!product) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }

    // Check stock and promotion
    const seller = product.sellers.find(
      (s) => s.sellerId.toString() === sellerId
    );
    if (seller.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Insufficient stock. Available: ${seller.stock}` });
    }

    // Determine price and promotion details
    let finalPrice = seller.price;
    let promotionDetails = null;
    if (seller.activePromotion && seller.promotions.length > 0) {
      const activePromo = seller.promotions.find(
        (p) => p.promotionId._id.toString() === seller.activePromotion.toString()
      );
      if (activePromo && activePromo.isActive) {
        finalPrice = activePromo.newPrice;
        promotionDetails = {
          promotionId: {
            _id: activePromo.promotionId._id,
            name: activePromo.promotionId.name,
            discountRate: activePromo.promotionId.discountRate,
          },
          oldPrice: activePromo.oldPrice,
          newPrice: activePromo.newPrice,
          image: activePromo.image,
        };
      }
    }

    // Validate provided price
    if (price !== finalPrice) {
      return res.status(400).json({ message: 'Provided price does not match current price' });
    }

    // Update or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            sellerId,
            quantity,
            price: finalPrice,
            stock: seller.stock,
            promotion: promotionDetails,
            variantId: variantId ? mongoose.Types.ObjectId(variantId) : undefined,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.sellerId.toString() === sellerId &&
          (item.variantId?.toString() === variantId || (!item.variantId && !variantId))
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].stock = seller.stock;
        cart.items[itemIndex].price = finalPrice;
        cart.items[itemIndex].promotion = promotionDetails;
      } else {
        cart.items.push({
          productId,
          sellerId,
          quantity,
          price: finalPrice,
          stock: seller.stock,
          promotion: promotionDetails,
          variantId: variantId ? mongoose.Types.ObjectId(variantId) : undefined,
        });
      }
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    let cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'reference name description images categoryDetails sellers',
        populate: [
          {
            path: 'categoryDetails.category',
            select: 'name'
          },
          {
            path: 'sellers.sellerId',
            select: 'shopName'
          },
          {
            path: 'sellers.promotions.promotionId',
            select: 'name discountRate image endDate'
          },
          {
            path: 'sellers.activePromotion',
            select: 'name discountRate image endDate'
          }
        ]
      })
      .populate({
        path: 'items.sellerId',
        select: 'shopName'
      });

    // If no cart exists, return an empty cart object
    if (!cart) {
      return res.status(200).json({ items: [], userId });
    }

    // Filter out invalid items and enrich with price/stock/promotion
    const validItems = [];
    const invalidItemIds = [];

    await Promise.all(
      cart.items.map(async (item) => {
        if (!item.productId || !item.sellerId) {
          console.warn(`Invalid cart item: ${item._id}`, {
            productId: item.productId,
            sellerId: item.sellerId,
          });
          invalidItemIds.push(item._id);
          return;
        }

        const product = await Product.findOne(
          { _id: item.productId._id, 'sellers.sellerId': item.sellerId._id },
          { 'sellers.$': 1 }
        ).populate('sellers.promotions.promotionId');

        if (!product) {
          console.warn(`Product not found for cart item: ${item._id}`);
          invalidItemIds.push(item._id);
          return;
        }

        const seller = product.sellers[0];
        let finalPrice = seller.price;
        let promotionDetails = null;

        if (seller.activePromotion && seller.promotions.length > 0) {
          const activePromo = seller.promotions.find(
            (p) => p.promotionId._id.toString() === seller.activePromotion.toString()
          );
          if (activePromo && activePromo.isActive) {
            finalPrice = activePromo.newPrice;
            promotionDetails = {
              promotionId: {
                _id: activePromo.promotionId._id,
                name: activePromo.promotionId.name,
                discountRate: activePromo.promotionId.discountRate,
              },
              oldPrice: activePromo.oldPrice,
              newPrice: activePromo.newPrice,
              image: activePromo.image,
            };
          }
        }

        validItems.push({
          ...item.toObject(),
          price: finalPrice,
          stock: seller.stock || 0,
          promotion: promotionDetails,
        });
      })
    );

    // Remove invalid items from cart
    if (invalidItemIds.length > 0) {
      cart.items = cart.items.filter(
        (item) => !invalidItemIds.includes(item._id)
      );
      await cart.save();
    }

    const enrichedCart = {
      ...cart.toObject(),
      items: validItems,
    };

    res.status(200).json(enrichedCart);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: err.message });
  }
};
// Delete an item from cart
exports.deleteCartItem = async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    // Find and update cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Remove the item
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update quantity of an item in cart
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find item
    const item = cart.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check stock and promotion for the product
    const product = await Product.findOne({
      _id: item.productId,
      'sellers.sellerId': item.sellerId,
    }).populate('sellers.promotions.promotionId');
    if (!product) {
      return res.status(404).json({ message: 'Product or seller not found' });
    }
    const seller = product.sellers.find(
      (s) => s.sellerId.toString() === item.sellerId.toString()
    );
    if (seller.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Insufficient stock. Available: ${seller.stock}` });
    }

    // Update price and promotion details
    let finalPrice = seller.price;
    let promotionDetails = null;
    if (seller.activePromotion && seller.promotions.length > 0) {
      const activePromo = seller.promotions.find(
        (p) => p.promotionId._id.toString() === seller.activePromotion.toString()
      );
      if (activePromo && activePromo.isActive) {
        finalPrice = activePromo.newPrice;
        promotionDetails = {
          promotionId: {
            _id: activePromo.promotionId._id,
            name: activePromo.promotionId.name,
            discountRate: activePromo.promotionId.discountRate,
          },
          oldPrice: activePromo.oldPrice,
          newPrice: activePromo.newPrice,
          image: activePromo.image,
        };
      }
    }

    // Update item
    item.quantity = quantity;
    item.stock = seller.stock;
    item.price = finalPrice;
    item.promotion = promotionDetails;
    await cart.save();

    res.status(200).json({ message: 'Item quantity updated', cart });
  } catch (err) {
    console.error('Update cart item quantity error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Delete entire cart
exports.deleteCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Delete cart
    const result = await Cart.deleteOne({ userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart deleted successfully' });
  } catch (err) {
    console.error('Delete cart error:', err);
    res.status(500).json({ message: err.message });
  }
};