const { DeliveryPerson } = require("../models/User");
const e = require("../utils/error");
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Register a delivery person
exports.registerDeliveryPerson = async (req, res, next) => {
  try {
    const { email, vehicleType, vehicleNumber, deliveryArea, contactNumber } = req.body;
    const cv = req.files?.cv?.[0];

    // Check if email already exists
    const existingDeliveryPerson = await DeliveryPerson.findOne({ email });
    if (existingDeliveryPerson) {
      return next(e.errorHandler(400, "Email already in use"));
    }

    // Create new delivery person without password
    const newDeliveryPerson = new DeliveryPerson({
      email,
      vehicleType,
      vehicleNumber,
      deliveryArea,
      contactNumber,
      cv: cv?.path,
      status: "pending",
      isActive: false
    });

    await newDeliveryPerson.save();

    res.status(201).json({
      message: "Application submitted successfully! Admin will review your request.",
      deliveryPerson: newDeliveryPerson
    });
  } catch (error) {
    next(error);
  }
};

// Get count of pending delivery person applications
exports.getPendingDeliveriesCount = async (req, res, next) => {
  try {
    const count = await DeliveryPerson.countDocuments({ status: 'pending' });
    res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

exports.getDeliveryStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const deliveries = await Delivery.find({ orderId });
    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEstimatedDeliveryTimeRange = (deliveryMethod) => {
  if (deliveryMethod === 'standard') {
    return '3-5 days';
  } else if (deliveryMethod === 'express') {
    return '1-2 days';
  } else {
    return 'N/A'; 
  }
};
exports.createDelivery = async (req, res) => {
  try {
    const {
      orderId,
      suborderId,
      sellerId,
      pickupAddress
    } = req.body;

    // Basic validation
    if (!orderId || !suborderId || !sellerId || !pickupAddress) {
      return res.status(400).json({ message: 'Order ID, suborder ID, seller ID, and pickup address are required.' });
    }

    // Check if order exists and populate shippingInfo
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check if suborder exists within the order
    const suborder = order.suborders.find(
      sub => sub._id.toString() === suborderId.toString()
    );
    if (!suborder) {
      return res.status(404).json({ message: 'Suborder not found in the specified order.' });
    }

    // Check if sellerId matches the suborder's sellerId
    if (suborder.sellerId.toString() !== sellerId.toString()) {
      return res.status(400).json({ message: 'Seller ID does not match the suborder.' });
    }

    // Check for existing delivery for the same suborder
    const existing = await Delivery.findOne({ suborderId });
    if (existing) {
      return res.status(409).json({ message: 'Delivery for this suborder already exists.' });
    }

    // Check if suborder status is 'processing'
    if (suborder.status !== 'processing') {
      return res.status(400).json({ message: 'Suborder status must be processing to create a delivery.' });
    }

    // Format the dropoffAddress from order.shippingInfo.address
    const { street, apartment, city, postalCode, governorate } = order.shippingInfo.address;
    const dropoffAddress = `${street}${apartment ? ', ' + apartment : ''}, ${city}, ${governorate}${postalCode ? ', ' + postalCode : ''}`;

    // Create delivery
    const newDelivery = new Delivery({
      orderId,
      suborderId,
      sellerId,
      pickupAddress,
      dropoffAddress,
      logs: [{ status: 'pending' }]
    });

    await newDelivery.save();

    res.status(201).json({
      message: 'Delivery created successfully',
      delivery: newDelivery
    });

  } catch (error) {
    console.error('Create Delivery Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    // Extract query parameters for filtering, sorting, and pagination
    const {
      status,
      sellerId,
      orderId,
      suborderId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object for filtering
    const query = {};
    if (status) query.status = status;
    if (sellerId) query.sellerId = sellerId;
    if (orderId) query.orderId = orderId;
    if (suborderId) query.suborderId = suborderId;

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Validate sortBy field
    const validSortFields = ['createdAt', 'updatedAt', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Fetch deliveries with population of related fields
    const deliveries = await Delivery.find(query)
      .populate({
        path: 'orderId',
        select: 'userId shippingInfo deliveryMethod total', // Include deliveryMethod
        populate: [
          {
            path: 'userId',
            select: 'firstName lastName email'
          },
          {
            path: 'shippingInfo.address', // Ensure address is populated if needed
            model: 'Order' // Address is embedded, so no separate model population
          }
        ]
      })
      .populate({
        path: 'sellerId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'deliveryPersonId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'suborderId',
        select: 'sellerId items subtotal status', // Populate suborder details
        populate: {
          path: 'items.productId',
          select: 'name price' // Populate product details in suborder items
        }
      })
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalDeliveries = await Delivery.countDocuments(query);

    // Format response
    res.status(200).json({
      message: 'Deliveries retrieved successfully',
      deliveries,
      pagination: {
        total: totalDeliveries,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalDeliveries / limitNum)
      }
    });

  } catch (error) {
    console.error('Get All Deliveries Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId, deliveryPersonId, status } = req.body;

    // Basic validation
    if (!deliveryId || !status) {
      return res.status(400).json({ message: 'Delivery ID and status are required.' });
    }

    // Validate status
    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found.' });
    }

    // Update fields
    delivery.status = status;
    if (deliveryPersonId) {
      delivery.deliveryPersonId = deliveryPersonId;
    }

    await delivery.save();

    res.status(200).json({
      message: 'Delivery status updated successfully',
      delivery
    });

  } catch (error) {
    console.error('Update Delivery Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDeliveriesByDeliveryPersonId = async (req, res) => {
  try {
    const { deliveryPersonId } = req.params; // Assuming deliveryPersonId is passed as a URL parameter

    // Basic validation
    if (!deliveryPersonId) {
      return res.status(400).json({ message: 'Delivery Person ID is required.' });
    }

    // Check if deliveryPersonId is a valid ObjectId
    if (!mongoose.isValidObjectId(deliveryPersonId)) {
      return res.status(400).json({ message: 'Invalid Delivery Person ID.' });
    }

    // Find deliveries by deliveryPersonId
    const deliveries = await Delivery.find({ deliveryPersonId })
      .populate('orderId', 'orderNumber shippingInfo') // Optional: Populate order details
      .populate('sellerId', 'name email') // Optional: Populate seller details
      .select('-__v'); // Exclude version key

    if (!deliveries || deliveries.length === 0) {
      return res.status(404).json({ message: 'No deliveries found for this delivery person.' });
    }

    res.status(200).json({
      message: 'Deliveries retrieved successfully',
      deliveries
    });

  } catch (error) {
    console.error('Get Deliveries By Delivery Person Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};