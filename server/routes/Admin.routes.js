const adminController = require("../controllers/AdminController");

module.exports = (app) => {
    app.put("/approve/:userId", adminController.approveApplication),
    app.put("/reject/:userId", adminController.rejectApplication),
    app.delete("/delete/:userId", adminController.deleteUser)
};
