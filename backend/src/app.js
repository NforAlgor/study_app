const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
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