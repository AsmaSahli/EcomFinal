const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config();
require("./config/mongoose");

const port = process.env.PORT;

// Configuration CORS pour autoriser les requêtes du frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Middleware pour parser le JSON et les requêtes URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
require("./routes/User.routes")(app);
require("./routes/Auth.routes")(app);
require("./routes/Seller.routes")(app);
require("./routes/Category.routes")(app);

// Middleware de gestion des erreurs
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

// Lancer le serveur
app.listen(port, () => console.log(`🚀 Server running on port: ${port}`));
