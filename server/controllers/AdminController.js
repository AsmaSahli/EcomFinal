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

exports.generateReport = async (req, res, next) => {
    try {
        const { stats, recentUsers } = req.body;

        // Format data with more context
        const dataSummary = `
            ### PLATFORM PERFORMANCE DATA ###
            
            USER BASE:
            - Total Registered Users: ${stats.totalUsers || 0}
            - New Users (7-day period): ${stats.newUsers || 0}
            - Active Sellers: ${stats.activeSellers || 0} (${Math.round((stats.activeSellers / stats.totalUsers) * 100)}% of total users)
            
            PENDING ACTIONS:
            - Seller Applications Pending: ${stats.pendingSellers || 0}
            - Delivery Partner Applications: ${stats.pendingDeliveries || 0}
            
            TRANSACTION METRICS:
            - Completed Deliveries: ${stats.completedDeliveries || 0}
            - Platform Revenue: $${stats.revenue || 0}
            
            RECENT USER ACTIVITY (Last 5 entries):
            ${recentUsers.map(u => `
            - ${u.name} (${u.email})
              Role: ${u.role}
              Status: ${u.status}
              ${u.lastActivity ? `Last Active: ${u.lastActivity}` : ''}
            `).join('')}
            `;

        // Enhanced prompt with specific instructions
        const prompt = `
            You are a senior business analyst preparing an executive dashboard report. 
            Create a comprehensive, professional report with these sections:
    
            1. EXECUTIVE SUMMARY (3-4 sentences highlighting key takeaways)
            2. PERFORMANCE METRICS (tabular data visualization)
            3. GROWTH ANALYSIS (trends with percentage changes)
            4. OPERATIONAL BOTTLENECKS (identified issues)
            5. STRATEGIC RECOMMENDATIONS (3-5 actionable items)
            6. USER ENGAGEMENT STRATEGIES (specific to recent activity)
            7. FINANCIAL PROJECTIONS (next quarter estimates)
    
            Format requirements:
            - Use markdown formatting
            - Include emojis for visual hierarchy (🎯, ⚠️, 📈)
            - Add relevant KPIs and percentages
            - Suggest 3 key focus areas for immediate action
    
            Data to analyze:
            ${dataSummary}
            `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
            success: true,
            report: text
        });

    } catch (error) {
        console.error('Enhanced report error:', error);
        res.status(500).json({
            success: false,
            message: "Report generation failed",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
