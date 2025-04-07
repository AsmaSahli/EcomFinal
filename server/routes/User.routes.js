const userController = require("../controllers/UserController");

module.exports = (app) => {
    app.post("/signout", userController.signout);
    app.put("/user/:id", userController.updateUser);
    app.patch("/user/:id/deactivate", userController.deactivateAccount);
    app.get("/user/:id", userController.getUserById);
    app.get("/application-status", userController.getApplicationStatus);
    app.get("/users", userController.getUsers);
    app.get("/users/sellers/stats", userController.getSellersStats);
    app.get("/users/deliveries/stats", userController.getDeliversStats);
    app.get("/dashboard/stats", userController.getDashboardStats);

};