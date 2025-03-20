const authController = require("../controllers/AuthController");

module.exports = (app) => {
    app.post("/signup", authController.signup);
    app.post("/signin", authController.signin);
    app.post("/google",authController.google);

    app.post("/forgot-password", authController.forgotPassword);


    app.post("/reset-password/:token", authController.resetPassword);
};
