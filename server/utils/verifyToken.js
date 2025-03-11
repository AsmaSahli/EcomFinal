const jwt = require("jsonwebtoken");
const e = require("../utils/error"); // Error handling utility

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Replace with your logic to find and validate user
    const user = await User.findOne({ email });
    if (!user) {
      return next(e.errorHandler(400, "Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(e.errorHandler(400, "Invalid email or password"));
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set the token as a cookie
    res.cookie("access_token", token, {
      httpOnly: true, // Ensures cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Set to true for HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Sign-in successful",
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signIn };
