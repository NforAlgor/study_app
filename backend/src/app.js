const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",    require("./routes/authRoutes"));
app.use("/api/tasks",   require("./routes/taskRoutes"));
app.use("/api/planner", require("./routes/plannerRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Smart Study Planner API is running." });
});

module.exports = app;