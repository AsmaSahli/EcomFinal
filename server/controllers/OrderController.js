const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Import the Cart model
const { User } = require("../models/User");
const { sendOrderConfirmationEmail } = require('../services/emailService');


// Create a new order
const createOrder = async (req, res) => {
    try {
      const {
        userId,
        items,
        shippingInfo,
        deliveryMethod,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total
      } = req.body;
  
      // Validate input
      if (!userId || !items || !items.length || !shippingInfo) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Validate product availability and stock
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            message: `Product with ID ${item.productId} not found`
          });
        }
  
        // Find the seller-specific data for the product
        const sellerData = product.sellers.find(
          (seller) => seller.sellerId.toString() === item.sellerId.toString()
        );
        if (!sellerData) {
          return res.status(400).json({
            message: `Seller with ID ${item.sellerId} not associated with product ${product.name}`
          });
        }
  
        if (sellerData.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for product: ${product.name}`
          });
        }
      }
  
      // Validate user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create the order
      const order = new Order({
        userId,
        items,
        shippingInfo,
        deliveryMethod,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total
      });
  
      // Save the order
      const savedOrder = await order.save();
  
      // Update product stock
      for (const item of items) {
        const updateResult = await Product.findOneAndUpdate(
          { _id: item.productId, 'sellers.sellerId': item.sellerId },
          { $inc: { 'sellers.$.stock': -item.quantity } },
          { new: true }
        );
  
        // Check if the update was successful
        if (!updateResult) {
          // Rollback the order if stock update fails
          await Order.deleteOne({ _id: savedOrder._id });
          return res.status(500).json({
            message: `Failed to update stock for product ID ${item.productId}`
          });
        }
      }
  
      // Remove ordered items from the user's cart
      const cart = await Cart.findOne({ userId });
      if (cart) {
        cart.items = cart.items.filter(
          (cartItem) =>
            !items.some(
              (orderItem) =>
                orderItem.productId.toString() === cartItem.productId.toString() &&
                orderItem.sellerId.toString() === cartItem.sellerId.toString()
            )
        );
  
        if (cart.items.length === 0) {
          await Cart.deleteOne({ userId });
        } else {
          await cart.save();
        }
      }
  
      // Populate the saved order with product and seller details
      const populatedOrder = await Order.findById(savedOrder._id)
        .populate({
          path: 'userId',
          select: 'name email'
        })
        .populate({
          path: 'items.productId',
          select: 'name images'
        })
        .populate({
          path: 'items.sellerId',
          select: 'name email'
        });
  
      // Send order confirmation email (async)
      sendOrderConfirmationEmail(user.email, populatedOrder, user)
        .catch((err) => console.error('Error sending confirmation email:', err));
  
      res.status(201).json({
        message: 'Order created successfully',
        order: populatedOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        message: 'Failed to create order',
        error: error.message
      });
    }
  };

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order and populate relevant fields
        const order = await Order.findById(orderId)
            .populate({
                path: 'userId',
                select: 'name email' // Populate user details
            })
            .populate({
                path: 'items.productId',
                select: 'name images price description' // Populate product details
            })
            .populate({
                path: 'items.sellerId',
                select: 'name email' // Populate seller details
            })
            .populate({
                path: 'items.promotion',
                select: 'name discount' // Populate promotion details if applicable
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order retrieved successfully',
            order
        });
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({
            message: 'Failed to retrieve order',
            error: error.message
        });
    }
};
// Get orders for a user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name images');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus
};