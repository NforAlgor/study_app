const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  markComplete,
} = require("../controllers/taskController");

// All task routes are protected
router.use(verifyToken);

// GET    /api/tasks
router.get("/", getTasks);

// POST   /api/tasks
router.post("/", createTask);

// PUT    /api/tasks/:id
router.put("/:id", updateTask);

// DELETE /api/tasks/:id
router.delete("/:id", deleteTask);

// PATCH  /api/tasks/:id/complete
router.patch("/:id/complete", markComplete);

module.exports = router;