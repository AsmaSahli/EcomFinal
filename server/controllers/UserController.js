const User = require("../models/User");
const bcrypt = require("bcrypt");
const e = require("../utils/error");

module.exports = {
    signout: (req, res, next) => {
        try {
            res
                .clearCookie('access_token')
                .status(200)
                .json('User has been signed out');
        } catch (error) {
            next(error);
        }
    },

    updateUser: async (req, res, next) => {
        const { id } = req.params; 
        const { name, email, password, newPassword, address, phoneNumber, shopName, headquartersAddress, vehicleType } = req.body; // Fields to update
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


            if (user.role === 'buyer') {
                if (address) user.address = address;
                if (phoneNumber) user.phoneNumber = phoneNumber;
            } else if (user.role === 'seller') {
                if (shopName) user.shopName = shopName;
                if (headquartersAddress) user.headquartersAddress = headquartersAddress;
            } else if (user.role === 'delivery') {
                if (vehicleType) user.vehicleType = vehicleType;
            }


            await user.save();

            res.status(200).json({ message: "User updated successfully", user });
        } catch (error) {
            next(error);
        }
    },

    deactivateAccount: async (req, res, next) => {
        const { id } = req.params;
        const { role } = req.user; 

        try {

            if (role !== 'admin') {
                return next(e.errorHandler(403, "Only admin can deactivate accounts"));
            }

            const user = await User.findById(id);
            if (!user) {
                return next(e.errorHandler(404, "User not found"));
            }


            user.isActive = false; 
            await user.save();

            res.status(200).json({ message: "Account deactivated successfully" });
        } catch (error) {
            next(error);
        }
    }
};