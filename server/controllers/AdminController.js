const { Seller, DeliveryPerson, User } = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
// Configure email transport
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Admin Approves Seller or Delivery Person
exports.approveApplication = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user || (user.role !== "seller" && user.role !== "delivery")) {
            return res.status(404).json({ message: "User not found or not eligible for approval" });
        }

        // Generate an approval token (expires in 24 hours)
        const token = crypto.randomBytes(32).toString("hex");
        user.approvalToken = token;
        user.approvalTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        user.status = "approved";
        await user.save();

        // Send email with token
        const approvalLink = `http://localhost:5173/set-password?token=${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your Application is Approved",
            html: `<p>Congratulations! Your application has been approved.</p>
                    <p>Click the link below to set your password:</p>
                    <a href="${approvalLink}">Set Password</a>`
        });

        res.json({ message: "User approved, email sent", user });
    } catch (error) {
        next(error);
    }
};

// Admin Rejects Application
exports.rejectApplication = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { rejectionReason } = req.body;

        const user = await User.findById(userId);
        if (!user || (user.role !== "seller" && user.role !== "delivery")) {
            return res.status(404).json({ message: "User not found or not eligible for rejection" });
        }

        user.status = "rejected";
        user.rejectionReason = rejectionReason;
        await user.save();

        // Send rejection email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your Application has been Rejected",
            html: `<p>We're sorry, but your application was not approved.</p>
                    <p>Reason: ${rejectionReason}</p>`
        });

        res.json({ message: "User rejected, email sent", user });
    } catch (error) {
        next(error);
    }
};
exports.deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user || (user.role !== "seller" && user.role !== "delivery")) {
            return res.status(404).json({ message: "User not found or not eligible for deletion" });
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: "User deleted successfully", userId });
    } catch (error) {
        next(error);
    }
};

exports.toggleUserStatus = async (req, res, next) => {
    try {
        
        const { userId } = req.params;
        const { action } = req.body; // 'activate' or 'deactivate'

        if (!['activate', 'deactivate'].includes(action)) {
            return res.status(400).json({ message: "Invalid action. Use 'activate' or 'deactivate'" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = action === 'activate';
        await user.save();

        // Send email notification
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your Application has been Rejected",
            html: `<p>We're sorry, but your application was not approved.</p>
                    <p>Reason: </p>`
        });

        res.json({
            message: `User account ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
            userId: user._id,
            isActive: user.isActive
        });
    } catch (error) {
        next(error);
    }
};
// Admin Suspends Seller or Delivery Person
exports.suspendUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user || (user.role !== "seller" && user.role !== "delivery")) {
            return res.status(404).json({ message: "User not found or not eligible for suspension" });
        }

        // Update user status to suspended and deactivate account
        user.status = "suspended";
        user.isActive = false;
        await user.save();

        // Send suspension email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your Account has been Suspended",
            html: `<p>Your account has been suspended.</p>
                   <p>Please contact support for more information.</p>`
        });

        res.json({ message: "User suspended successfully", userId: user._id });
    } catch (error) {
        next(error);
    }
};
exports.cancelSuspension = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user || (user.role !== "seller" && user.role !== "delivery")) {
            return res.status(404).json({ message: "User not found or not eligible for cancellation of suspension" });
        }

        if (user.status !== "suspended") {
            return res.status(400).json({ message: "User is not suspended" });
        }

        // Update user status to approved and activate account
        user.status = "approved";
        user.isActive = true;
        await user.save();

        // Send cancellation email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your Account Suspension has been Canceled",
            html: `<p>Your account suspension has been canceled, and your account is now active.</p>
                   <p>You can resume using your account as usual.</p>`
        });

        res.json({ message: "User suspension canceled successfully", userId: user._id });
    } catch (error) {
        next(error);
    }
};

