const webpush = require("web-push");
require("dotenv").config();

// VAPID keys authenticate your server to the browser push service.
// Generate ONCE with: node -e "const wp=require('web-push'); console.log(wp.generateVAPIDKeys())"
// Then paste the output into your .env file.
webpush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a single subscription object
 * @param {object} subscription  - the PushSubscription saved from the browser
 * @param {object} payload       - { title, body, url }
 */
exports.sendPushNotification = async (subscription, payload) => {
  const data = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    url:   payload.url || "/planner",
    icon:  "/icon-192.png",
    badge: "/icon-72.png",
  });

  await webpush.sendNotification(subscription, data);
};

/**
 * Expose the VAPID public key so the frontend can subscribe
 */
exports.getVapidPublicKey = () => process.env.VAPID_PUBLIC_KEY;