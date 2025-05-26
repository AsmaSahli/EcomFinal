const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart'); // Import the Cart model
const { User } = require("../models/User");
const { sendOrderConfirmationEmail } = require('../services/emailService');
const mongoose = require('mongoose');

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
  
      // Group items by seller for suborders
      const suborders = [];
      const sellerMap = new Map();
  
      for (const item of items) {
        const sellerId = item.sellerId.toString();
        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            sellerId: item.sellerId,
            items: [],
            subtotal: 0,
            status: 'pending' // Initialize suborder status
          });
        }
        const suborder = sellerMap.get(sellerId);
        suborder.items.push(item);
        suborder.subtotal += item.price * item.quantity;
      }
  
      sellerMap.forEach((suborder) => suborders.push(suborder));
  
      // Create the order
      const order = new Order({
        userId,
        items,
        suborders,
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
  
        if (!updateResult) {
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
  
      // Populate the saved order
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
        })
        .populate({
          path: 'suborders.sellerId',
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
  
  const getSellerSuborders = async (req, res) => {
    try {
      const { sellerId } = req.params;
  
      // Validate sellerId
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        return res.status(400).json({ message: 'Invalid sellerId' });
      }
  
      // Convert sellerId to ObjectId
      const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
  
      // Find orders with suborders for the seller
      const orders = await Order.find({ 'suborders.sellerId': sellerObjectId })
        .populate({
          path: 'userId',
          select: 'name email',
        })
        .populate({
          path: 'suborders.items.productId',
          select: 'name images',
        })
        .populate({
          path: 'suborders.sellerId',
          select: 'name email',
        })
        .lean();
  
      // Extract seller's suborders
      const sellerSuborders = orders.flatMap((order) =>
        order.suborders
          .filter((suborder) => suborder.sellerId._id.toString() === sellerId)
          .map((suborder) => ({
            orderId: order._id,
            buyer: {
              userId: order.userId._id,
              name: order.userId.name,
              email: order.userId.email,
            },
            shippingInfo: order.shippingInfo,
            deliveryMethod: order.deliveryMethod,
            paymentMethod: order.paymentMethod,
            orderStatus: order.status,
            paymentStatus: order.paymentStatus,
            suborder: {
              sellerId: suborder.sellerId,
              items: suborder.items,
              subtotal: suborder.subtotal,
              status: suborder.status,
            },
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
          }))
      );
  
      if (!sellerSuborders.length) {
        return res.status(404).json({ message: 'No suborders found for this seller' });
      }
  
      res.status(200).json({
        message: 'Suborders retrieved successfully',
        suborders: sellerSuborders,
      });
    } catch (error) {
      console.error('Error fetching seller suborders:', error);
      res.status(500).json({
        message: 'Failed to fetch suborders',
        error: error.message,
      });
    }
  };
  



// Get order by ID
const getOrderById = async (req, res) => {
    try {
      const { orderId  } = req.params;
  
      // Validate orderId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid orderId' });
      }
  
      // Find the order and populate relevant fields
      const order = await Order.findById(orderId)
        .populate({
          path: 'userId',
          select: 'name email',
        })
        .populate({
          path: 'items.productId',
          select: 'name images price description',
        })
        .populate({
          path: 'items.sellerId',
          select: 'name email',
        })
        .populate({
          path: 'items.promotion',
          select: 'name discount',
        })
        .populate({
          path: 'suborders.sellerId',
          select: 'name email shopName',
        })
        .populate({
          path: 'suborders.items.productId',
          select: 'name images price description',
        });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({
        message: 'Order retrieved successfully',
        order,
      });
    } catch (error) {
      console.error('Error retrieving order:', error);
      res.status(500).json({
        message: 'Failed to retrieve order',
        error: error.message,
      });
    }
  };
  const getUserOrders = async (req, res) => {
    try {
        const { userId } =req.params; 
  
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
      }
  
      // Find all orders for the user
      const orders = await Order.find({ userId })
        .populate({
          path: 'userId',
          select: 'name email',
        })
        .populate({
          path: 'items.productId',
          select: 'name images price description',
        })
        .populate({
          path: 'items.sellerId',
          select: 'name email',
        })
        .populate({
          path: 'items.promotion',
          select: 'name discount',
        })
        .populate({
          path: 'suborders.sellerId',
          select: 'name email',
        })
        .populate({
          path: 'suborders.items.productId',
          select: 'name images price description',
        })
        .sort({ createdAt: -1 }); // Sort by creation date, newest first
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }
  
      res.status(200).json({
        message: 'Orders retrieved successfully',
        orders,
      });
    } catch (error) {
      console.error('Error retrieving user orders:', error);
      res.status(500).json({
        message: 'Failed to retrieve orders',
        error: error.message,
      });
    }
  };

// Update order status

const updateOrderStatus = async (req, res) => {
    try {
      const { orderId, suborderId, status } = req.body;
  
      // Validate input
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid orderId' });
      }
      if (!mongoose.Types.ObjectId.isValid(suborderId)) {
        return res.status(400).json({ message: 'Invalid suborderId' });
      }
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Find the suborder
      const suborder = order.suborders.find(
        (sub) => sub._id.toString() === suborderId
      );
      if (!suborder) {
        return res.status(404).json({ message: 'Suborder not found' });
      }
  
      // Update suborder status
      suborder.status = status;
      suborder.statusUpdatedAt = Date.now();
  
      // Update parent order status based on logic
      if (order.suborders.length === 1) {
        // Single suborder: Parent order status matches suborder status
        order.status = status;
        if (status === 'delivered') {
          order.paymentStatus = 'paid';
        }
      } else {
        // Multiple suborders
        // Check the statuses of all suborders
        const suborderStatuses = order.suborders.map(sub => sub.status);
        const hasProcessing = suborderStatuses.includes('processing');
        const hasShipped = suborderStatuses.includes('shipped');
        const hasDelivered = suborderStatuses.includes('delivered');
        const allCancelled = suborderStatuses.every(status => status === 'cancelled');
        const allDelivered = suborderStatuses.every(status => status === 'delivered');
  
        if (hasProcessing) {
          // If any suborder is processing, parent order is processing
          order.status = 'processing';
        } else if (allDelivered) {
          // If all suborders are delivered, parent order is delivered
          order.status = 'delivered';
          order.paymentStatus = 'paid';
        } else if (allCancelled) {
          // If all suborders are cancelled, parent order is cancelled
          order.status = 'cancelled';
        } else if (hasShipped || (hasDelivered && suborderStatuses.some(status => status !== 'delivered'))) {
          // If any suborder is shipped or there's a mix of delivered and non-delivered (but not processing), parent order is shipped
          order.status = 'shipped';
        } else {
          // Default to processing if none of the above conditions are met
          order.status = 'processing';
        }
      }
  
      // Update the statusUpdatedAt timestamp
      order.statusUpdatedAt = Date.now();
  
      // Save the order
      await order.save();
  
      // Populate the updated order
      const populatedOrder = await Order.findById(orderId)
        .populate({
          path: 'userId',
          select: 'name email',
        })
        .populate({
          path: 'items.productId',
          select: 'name images price description',
        })
        .populate({
          path: 'items.sellerId',
          select: 'name email',
        })
        .populate({
          path: 'items.promotion',
          select: 'name discount',
        })
        .populate({
          path: 'suborders.sellerId',
          select: 'name email',
        })
        .populate({
          path: 'suborders.items.productId',
          select: 'name images price description',
        });
  
      res.status(200).json({
        message: 'Order and suborder status updated successfully',
        order: populatedOrder,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        message: 'Failed to update order status',
        error: error.message,
      });
    }
};
  
  
  // Export the new function along with existing ones
  module.exports = {
    createOrder,
    getOrderById,
    getUserOrders,
    updateOrderStatus,
    getSellerSuborders
  };