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
// Update order status
const updateOrderStatus = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, paymentStatus } = req.body;
  
      // Validate input
      if (!status && !paymentStatus) {
        return res.status(400).json({ message: 'At least one of status or paymentStatus is required' });
      }
  
      // Define valid statuses
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
  
      // Validate status if provided
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
  
      // Validate paymentStatus if provided
      if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}` });
      }
  
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Update fields if provided
      if (status) {
        order.status = status;
      }
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
  
      // Update statusUpdatedAt to track when the status was last changed
      order.statusUpdatedAt = new Date();
  
      // Save the updated order
      const updatedOrder = await order.save();
  
      // Populate the updated order with product and seller details
      const populatedOrder = await Order.findById(updatedOrder._id)
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
        });
  
      // Optionally send notification (e.g., email) for status change
      sendOrderConfirmationEmail(
        populatedOrder.userId.email,
        populatedOrder,
        populatedOrder.userId,
        `Order Status Updated: ${status || paymentStatus}`
      ).catch((err) => console.error('Error sending status update email:', err));
  
      res.status(200).json({
        message: 'Order status updated successfully',
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

// Split an order into separate orders based on sellers
const splitOrderBySeller = async (req, res) => {
    try {
      const { orderId, preview } = req.query; 
      // Validate orderId
      if (!orderId) {
        return res.status(400).json({ message: 'orderId is required in query parameters' });
      }
  
      // Find the original order and populate necessary fields
      const originalOrder = await Order.findById(orderId)
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
        });
  
      if (!originalOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Group items by sellerId
      const itemsBySeller = {};
      for (const item of originalOrder.items) {
        const sellerId = item.sellerId._id.toString();
        if (!itemsBySeller[sellerId]) {
          itemsBySeller[sellerId] = {
            seller: item.sellerId,
            items: [],
            subtotal: 0,
          };
        }
        itemsBySeller[sellerId].items.push(item);
        itemsBySeller[sellerId].subtotal += item.price * item.quantity;
      }
  
      // Prepare split orders
      const splitOrders = [];
      for (const sellerId in itemsBySeller) {
        const { items, subtotal, seller } = itemsBySeller[sellerId];
  
        // Calculate shipping and tax (proportionally based on subtotal)
        const sellerSubtotalRatio = subtotal / originalOrder.subtotal;
        const shipping = originalOrder.shipping * sellerSubtotalRatio;
        const tax = originalOrder.tax * sellerSubtotalRatio;
        const total = subtotal + shipping + tax;
  
        // Create order object (not saved yet)
        const newOrder = {
          userId: originalOrder.userId._id,
          items: items,
          shippingInfo: originalOrder.shippingInfo,
          deliveryMethod: originalOrder.deliveryMethod,
          paymentMethod: originalOrder.paymentMethod,
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          total: total,
          status: 'pending',
          paymentStatus: originalOrder.paymentStatus,
          statusUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
  
        if (preview === 'true') {
          // For preview, add populated data without saving
          splitOrders.push({
            ...newOrder,
            userId: originalOrder.userId,
            items: items.map(item => ({
              ...item.toObject(),
              productId: item.productId,
              sellerId: item.sellerId,
              promotion: item.promotion,
            })),
          });
        } else {
          // Save the new order
          const savedOrder = await new Order(newOrder).save();
  
          // Populate the saved order
          const populatedOrder = await Order.findById(savedOrder._id)
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
            });
  
          // Send order confirmation email to user
          sendOrderConfirmationEmail(
            originalOrder.userId.email,
            populatedOrder,
            originalOrder.userId,
            `Order Split for Seller: ${seller.name}`
          ).catch((err) => console.error('Error sending split order email:', err));
  
          splitOrders.push(populatedOrder);
        }
      }
  
      // If not in preview mode, mark the original order as cancelled
      if (preview !== 'true') {
        originalOrder.status = 'cancelled';
        originalOrder.statusUpdatedAt = new Date();
        await originalOrder.save();
      }
  
      res.status(200).json({
        message: preview === 'true' ? 'Order split preview generated successfully' : 'Order split successfully by seller',
        orders: splitOrders,
      });
    } catch (error) {
      console.error('Error splitting order by seller:', error);
      res.status(500).json({
        message: 'Failed to split order',
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
    splitOrderBySeller,
  };