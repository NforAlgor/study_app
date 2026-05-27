const app = require("./src/app");
require("dotenv").config();

// Initialise DB connection on startup
require("./src/config/db");

const port = process.env.PORT || 5000;
const { startReminderJob } = require("./src/jobs/reminderJob");
startReminderJob();
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});