const { Seller } = require("../models/User");
const e = require("../utils/error");

module.exports = {
  registerSeller: async (req, res, next) => {
    try {
      const { email, shopName, headquartersAddress } = req.body;
      const fiscalIdentificationCard = req.files?.fiscalIdentificationCard?.[0];
      const tradeRegister = req.files?.tradeRegister?.[0];

      // Check if email already exists
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return next(e.errorHandler(400, "Email already in use"));
      }

      // Create new seller
      const newSeller = new Seller({
        email,
        shopName,
        headquartersAddress,
        fiscalIdentificationCard: fiscalIdentificationCard?.path,
        tradeRegister: tradeRegister?.path,
        status: "pending",
      });

      await newSeller.save();
      res
        .status(201)
        .json({
          message: "Seller registration request submitted successfully",
          seller: newSeller,
        });
    } catch (error) {
      next(error);
    }
  },
  getSellerDetails: async (req, res, next) => {
    try {
      const { sellerId } = req.params;

      const seller = await Seller.findById(sellerId).select("-password -__v");
      if (!seller) {
        return next(e.errorHandler(404, "Seller not found"));
      }

      res.status(200).json({ seller });
    } catch (error) {
      next(error);
    }
  },
  getPendingSellersCount: async (req, res, next) => {
    try {
      const count = await Seller.countDocuments({ status: "pending" });
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  },
};
