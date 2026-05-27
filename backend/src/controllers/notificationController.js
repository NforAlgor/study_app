const db = require("../config/db");
const { getVapidPublicKey } = require("../services/pushService");

// GET /api/notifications/vapid-key
// Returns the VAPID public key so the frontend can subscribe
exports.getVapidKey = (req, res) => {
  const key = getVapidPublicKey();
  if (!key) {
    return res.status(500).json({ message: "VAPID keys not configured." });
  }
  return res.status(200).json({ publicKey: key });
};

// POST /api/notifications/subscribe
// Saves a browser PushSubscription object linked to the logged-in user
exports.subscribe = (req, res) => {
  const userId      = req.user.id;
  const subscription = req.body.subscription;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: "Invalid subscription object." });
  }

  const subString = JSON.stringify(subscription);

  // Avoid duplicate subscriptions for the same endpoint
  const checkQuery = "SELECT id FROM push_subscriptions WHERE user_id = ? AND subscription = ?";
  db.query(checkQuery, [userId, subString], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    if (results.length > 0) {
      return res.status(200).json({ message: "Already subscribed." });
    }

    const insertQuery = "INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?)";
    db.query(insertQuery, [userId, subString], (err) => {
      if (err) return res.status(500).json({ message: "Could not save subscription.", error: err.message });
      return res.status(201).json({ message: "Push subscription saved." });
    });
  });
};

// DELETE /api/notifications/unsubscribe
// Removes the push subscription for this user
exports.unsubscribe = (req, res) => {
  const userId   = req.user.id;
  const endpoint = req.body.endpoint;

  if (!endpoint) {
    return res.status(400).json({ message: "Endpoint required." });
  }

  // Delete any subscription for this user that contains this endpoint
  const query = "DELETE FROM push_subscriptions WHERE user_id = ? AND subscription LIKE ?";
  db.query(query, [userId, `%${endpoint}%`], (err) => {
    if (err) return res.status(500).json({ message: "Could not remove subscription.", error: err.message });
    return res.status(200).json({ message: "Unsubscribed successfully." });
  });
};

// GET /api/notifications/status
// Tells the frontend whether this user has an active push subscription
exports.getStatus = (req, res) => {
  const userId = req.user.id;
  const query = "SELECT COUNT(*) AS count FROM push_subscriptions WHERE user_id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    return res.status(200).json({ subscribed: results[0].count > 0 });
  });
};