
const { User, Buyer, Seller, DeliveryPerson, Admin } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("../utils/error");

module.exports = {
    signout: (req, res, next) => {
        try {
            res
                .clearCookie('access_token', { path: '/' })
                .status(200)
                .json('User has been signed out');
        } catch (error) {
            next(error);
        }
    },

    updateUser: async (req, res, next) => {
        const { id } = req.params;
        const {
            name, email, password, newPassword,
            address, phoneNumber, // buyer
            shopName, headquartersAddress, fiscalIdentificationCard, tradeRegister, businessDescription, logo, // seller
            vehicleType, vehicleNumber, deliveryArea, contactNumber, cv, // delivery
        } = req.body;

        const { role, userId } = req.user;

        try {
            const user = await User.findById(id);
            if (!user) {
                return next(e.errorHandler(404, "User not found"));
            }

            if (userId !== id && role !== 'admin') {
                return next(e.errorHandler(403, "You can only update your own profile"));
            }

            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return next(e.errorHandler(400, "Invalid email format"));
                }
                const existingUser = await User.findOne({ email });
                if (existingUser && existingUser._id.toString() !== id) {
                    return next(e.errorHandler(400, "Email already in use"));
                }
                user.email = email;
            }

            if (password && newPassword) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return next(e.errorHandler(400, "Current password is incorrect"));
                }
                if (newPassword.length < 6) {
                    return next(e.errorHandler(400, "Password must be at least 6 characters"));
                }
                user.password = await bcrypt.hash(newPassword, 10);
            }

            if (name) user.name = name;

            // Role-based fields
            if (user.role === 'buyer') {
                if (address) user.address = address;
                if (phoneNumber) user.phoneNumber = phoneNumber;
            } else if (user.role === 'seller') {
                if (shopName) user.shopName = shopName;
                if (headquartersAddress) user.headquartersAddress = headquartersAddress;
                if (fiscalIdentificationCard) user.fiscalIdentificationCard = fiscalIdentificationCard;
                if (tradeRegister) user.tradeRegister = tradeRegister;
                if (businessDescription) user.businessDescription = businessDescription;
                if (logo) user.logo = logo;
            } else if (user.role === 'delivery') {
                if (vehicleType) user.vehicleType = vehicleType;
                if (vehicleNumber) user.vehicleNumber = vehicleNumber;
                if (deliveryArea) user.deliveryArea = deliveryArea;
                if (contactNumber) user.contactNumber = contactNumber;
                if (cv) user.cv = cv;
            }

            await user.save();

            res.status(200).json({ message: "User updated successfully", user });
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
                rejectionReason: user.status === "rejected" ? user.rejectionReason : null
            });
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
            const total = await User.countDocuments({ role: 'seller' });
            const verified = await User.countDocuments({ role: 'seller', status: 'approved' });
            const pending = await User.countDocuments({ role: 'seller', status: { $in: ['pending', 'under_review'] } });
            const suspended = await User.countDocuments({ role: 'seller', status: 'rejected' });

            res.status(200).json({
                total,
                verified,
                pending,
                suspended
            });
        } catch (error) {
            next(error);
        }
    },

    getDeliversStats: async (req, res, next) => {
        try {
            const total = await User.countDocuments({ role: 'delivery' });
            const pending = await User.countDocuments({
                role: 'delivery',
                status: { $in: ['pending', 'under_review'] }
            });
            const approved = await User.countDocuments({
                role: 'delivery',
                status: 'approved'
            });
            const rejected = await User.countDocuments({
                role: 'delivery',
                status: 'rejected'
            });

            res.status(200).json({
                total,
                pending,
                approved,
                rejected
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
                role: 'seller',
                status: 'approved',
                isActive: true
            });

            // Count delivery persons (pending approval)
            const pendingDeliveries = await User.countDocuments({
                role: 'delivery',
                status: { $in: ['pending', 'under_review'] }
            });

            // Count new users this week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const newUsers = await User.countDocuments({
                createdAt: { $gte: oneWeekAgo }
            });

            // Count approved delivery persons
            const completedDeliveries = await User.countDocuments({
                role: 'delivery',
                status: 'approved'
            });

            // Mock revenue data (replace with actual calculation)
            const revenue = 12500;

            res.status(200).json({
                totalUsers,
                activeSellers,
                pendingDeliveries,
                revenue,
                newUsers,
                completedDeliveries
            });
        } catch (error) {
            next(error);
        }
    },


};
