const express = require("express");
const router  = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getVapidKey,
  subscribe,
  unsubscribe,
  getStatus,
} = require("../controllers/notificationController");

// GET  /api/notifications/vapid-key  — public, needed before user logs in to subscribe
router.get("/vapid-key", getVapidKey);

// All routes below require auth
router.use(verifyToken);

// POST   /api/notifications/subscribe
router.post("/subscribe", subscribe);

// DELETE /api/notifications/unsubscribe
router.delete("/unsubscribe", unsubscribe);

// GET    /api/notifications/status
router.get("/status", getStatus);

module.exports = router;