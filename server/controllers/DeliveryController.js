const { DeliveryPerson } = require("../models/User");
const e = require("../utils/error");


module.exports = {
  registerDeliveryPerson: async (req, res, next) => {
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
  },


};