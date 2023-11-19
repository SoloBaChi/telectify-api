const { Router } = require("express");
const {
  getProfile,
  updateProfile,
} = require("../controllers/tenant.controller");

const router = Router();

// get teanants profile
router.get("/profile", getProfile);

// update teanants profifl
router.put("/update-profile", updateProfile);

module.exports = router;
