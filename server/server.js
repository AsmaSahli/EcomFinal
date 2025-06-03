const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Ensure jsonwebtoken is installed

require("dotenv").config();
require("./config/mongoose");

const port = process.env.PORT || 8000; // Default to 8000 if PORT is not set

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
require("./routes/User.routes")(app);
require("./routes/Auth.routes")(app);
require("./routes/Seller.routes")(app);
require("./routes/Category.routes")(app);
require("./routes/Delivery.routes")(app);
require("./routes/Admin.routes")(app);

const promotionRoutes = require('./routes/Promotion.routes');
const reviewRoutes = require('./routes/Review.routes');
const productRoutes = require("./routes/Product.routes");
const productTagRoutes = require("./routes/productTag.routes");
const cartRoutes = require('./routes/Cart.routes');
const orderRoutes = require('./routes/Order.routes');
const wishlistRoutes = require('./routes/Wishlist.routes');

app.use('/api/promotions', promotionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-tags", productTagRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Metabase Embed Token Route
const METABASE_SITE_URL = "http://localhost:3000"; // Your Metabase instance URL
const METABASE_SECRET_KEY = "a0c561f13d99ba395a05e50a6b0ed47102c97459335923a8a3a97840c59101cb"; // Your secret key

app.get('/api/metabase-embed-token/:dashboardId', (req, res) => {
  try {
    const dashboardId = req.params.dashboardId;
    const {  startDate, endDate } = req.query; // Optional filter parameters

      const payload = {
        resource: { dashboard: 2 },
        params: {},
        exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
      };
      const token = jwt.sign(payload, METABASE_SECRET_KEY);
          const embedUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
          res.json({ embedUrl });
        } catch (error) {
          console.error('Error generating embed token:', error);
          res.status(500).json({ success: false, message: 'Failed to generate embed URL' });
        }
      });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message
  });
});

// Start the server
app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));