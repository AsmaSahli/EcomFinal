const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken"); 

require("dotenv").config();
require("./config/mongoose");

const port = process.env.PORT || 8000; 

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
const paymenetRoutes = require('./routes/payment.routes');
app.use('/uploads', express.static('uploads'));

app.use('/api/promotions', promotionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/product-tags", productTagRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payments', paymenetRoutes);


const METABASE_SITE_URL = "http://localhost:3000"; 
const METABASE_SECRET_KEY = "a0c561f13d99ba395a05e50a6b0ed47102c97459335923a8a3a97840c59101cb"; 

app.get('/api/metabase-embed-token/:dashboardId', (req, res) => {
  try {
    const dashboardId = parseInt(req.params.dashboardId, 10); 
    const { startDate, endDate } = req.query; 


    if (!dashboardId || isNaN(dashboardId)) {
      return res.status(400).json({ success: false, message: 'Invalid dashboard ID' });
    }

    const allowedDashboards = [2, 4];
    if (!allowedDashboards.includes(dashboardId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized dashboard access' });
    }


    const payload = {
      resource: { dashboard: dashboardId },
      params: {
        ...(startDate && { start_date: startDate }), 
        ...(endDate && { end_date: endDate }),      
      },
      exp: Math.round(Date.now() / 1000) + (10 * 60), 
    };


    const token = jwt.sign(payload, METABASE_SECRET_KEY);


    const embedUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;


    res.json({ success: true, embedUrl });
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