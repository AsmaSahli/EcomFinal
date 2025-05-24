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


