const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../config/cloudinary.config");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.put(
  "/profile",
  protect,
  upload.single("avatar"),
  authController.updateProfile
);
router.post("/upgrade", protect, authController.upgradeUser);

module.exports = router;
