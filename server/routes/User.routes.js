const userController = require("../controllers/UserController");

module.exports = (app) => {
    app.post("/signout", userController.signout);
    app.put("/user/:id", userController.updateUser);
    app.patch("/user/:id/deactivate", userController.deactivateAccount);
    app.get("/user/:id", userController.getUserById);
};
