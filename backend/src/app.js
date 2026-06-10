const express = require("express");
const cors = require("cors");
const app = express();

const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
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