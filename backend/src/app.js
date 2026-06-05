const express = require("express");
const app = express();
const cors = require("cors");

const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_URL_2 = process.env.FRONTEND_URL_2;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (FRONTEND_URL) {
      const allowed = [FRONTEND_URL];
      if (FRONTEND_URL_2) allowed.push(FRONTEND_URL_2);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/tasks",         require("./routes/taskRoutes"));
app.use("/api/planner",       require("./routes/plannerRoutes"));
app.use("/api/profile",       require("./routes/profileRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Smart Study Planner API is running." });
});

module.exports = app;