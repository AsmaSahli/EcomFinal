const {
  User,
  Buyer,
  Seller,
  DeliveryPerson,
  Admin,
} = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("../utils/error");

module.exports = {
  signout: (req, res, next) => {
    try {
      res
        .clearCookie("access_token", { path: "/" })
        .status(200)
        .json("User has been signed out");
    } catch (error) {
      next(error);
    }
  },

  // New method to get user by ID
  getUserById: async (req, res, next) => {
    const { id } = req.params;

    try {
      const user = await User.findById(id);
      if (!user) {
        return next(e.errorHandler(404, "User not found"));
      }

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },

  getApplicationStatus: async (req, res, next) => {
    try {
      const { email } = req.query;
      const user = await User.findOne({ email });

      if (!user || (user.role !== "seller" && user.role !== "delivery")) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({
        status: user.status,
        rejectionReason:
          user.status === "rejected" ? user.rejectionReason : null,
      });
    } catch (error) {
      next(error);
    }
  },
  updateUser: async (req, res, next) => {
    try {
      const userId = req.params.id;
      const { name, email, phoneNumber, address, password, newPassword } =
        req.body;

      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
        return next(e.errorHandler(404, "User not found"));
      }

      // Verify current password if newPassword is provided
      if (newPassword && password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return next(e.errorHandler(401, "Current password is incorrect"));
        }
        user.password = await bcrypt.hash(newPassword, 10);
      }

      // Update fields based on role
      if (user.role === "buyer") {
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;
      } else if (user.role === "seller") {
        if (name) user.name = name;
        if (email) user.email = email;
        // Seller-specific fields like shopName, headquartersAddress, etc., are not updated here
      } else if (user.role === "delivery") {
        if (name) user.name = name;
        if (email) user.email = email;
        // Delivery-specific fields like vehicleType, etc., are not updated here
      } else if (user.role === "admin") {
        if (name) user.name = name;
        if (email) user.email = email;
      }

      // Save updated user
      await user.save();
      res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  getUsers: async (req, res, next) => {
    try {
      let { page = 1, limit = 10, role } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);

      // Build query object
      const query = {};
      if (role) {
        query.role = role;
      }

      const totalUsers = await User.countDocuments(query);
      const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      const from = (page - 1) * limit + 1;
      const to = Math.min(from + users.length - 1, totalUsers);

      res.status(200).json({
        users,
        total: totalUsers,
        page,
        limit,
        showing: `${from} - ${to} of ${totalUsers} users`,
      });
    } catch (error) {
      next(error);
    }
  },

  getSellersStats: async (req, res, next) => {
    try {
      const total = await User.countDocuments({ role: "seller" });
      const verified = await User.countDocuments({
        role: "seller",
        status: "approved",
      });
      const pending = await User.countDocuments({
        role: "seller",
        status: { $in: ["pending", "under_review"] },
      });
      const suspended = await User.countDocuments({
        role: "seller",
        status: "rejected",
      });

      res.status(200).json({
        total,
        verified,
        pending,
        suspended,
      });
    } catch (error) {
      next(error);
    }
  },

  getDeliversStats: async (req, res, next) => {
    try {
      const total = await User.countDocuments({ role: "delivery" });
      const pending = await User.countDocuments({
        role: "delivery",
        status: { $in: ["pending", "under_review"] },
      });
      const approved = await User.countDocuments({
        role: "delivery",
        status: "approved",
      });
      const rejected = await User.countDocuments({
        role: "delivery",
        status: "rejected",
      });

      res.status(200).json({
        total,
        pending,
        approved,
        rejected,
      });
    } catch (error) {
      next(error);
    }
  },

  getDashboardStats: async (req, res, next) => {
    try {
      // Count all users
      const totalUsers = await User.countDocuments({});

      // Count active sellers (approved and active)
      const activeSellers = await User.countDocuments({
        role: "seller",
        status: "approved",
        isActive: true,
      });

      // Count delivery persons (pending approval)
      const pendingDeliveries = await User.countDocuments({
        role: "delivery",
        status: { $in: ["pending", "under_review"] },
      });

      // Count new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newUsers = await User.countDocuments({
        createdAt: { $gte: oneWeekAgo },
      });

      // Count approved delivery persons
      const completedDeliveries = await User.countDocuments({
        role: "delivery",
        status: "approved",
      });

      // Mock revenue data (replace with actual calculation)
      const revenue = 12500;

      res.status(200).json({
        totalUsers,
        activeSellers,
        pendingDeliveries,
        revenue,
        newUsers,
        completedDeliveries,
      });
    } catch (error) {
      next(error);
    }
  },
};
