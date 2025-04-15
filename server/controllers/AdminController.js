    const { Seller, DeliveryPerson, User } = require("../models/User");
    const crypto = require("crypto");
    const nodemailer = require("nodemailer");

    // Configure email transport
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

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
