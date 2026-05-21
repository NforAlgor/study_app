const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { generatePlan } = require("../controllers/plannerController");

// All planner routes are protected
router.use(verifyToken);

// POST /api/planner/generate
router.post("/generate", generatePlan);

module.exports = router;