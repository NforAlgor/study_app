/**
 * Run this ONCE to generate your VAPID keys:
 *   node generate-vapid-keys.js
 *
 * Then copy the output into your .env file:
 *   VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 */
const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();

console.log("\n✅ VAPID Keys Generated — paste these into your .env file:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("\n⚠️  Keep VAPID_PRIVATE_KEY secret. Never commit it to GitHub.\n");