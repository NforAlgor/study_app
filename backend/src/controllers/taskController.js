const db = require("../config/db");

// GET /api/tasks  — get all tasks for logged-in user
exports.getTasks = (req, res) => {
  const userId = req.user.id;

  const query = "SELECT * FROM tasks WHERE user_id = ? ORDER BY deadline ASC";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    return res.status(200).json({ tasks: results });
  });
};

// POST /api/tasks  — create a new task
exports.createTask = (req, res) => {
  const userId = req.user.id;
  const { title, deadline, importance, difficulty } = req.body;

  if (!title || !deadline || !importance || !difficulty) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (importance < 1 || importance > 3 || difficulty < 1 || difficulty > 3) {
    return res.status(400).json({ message: "Importance and difficulty must be between 1 and 3." });
  }

  const query =
    "INSERT INTO tasks (user_id, title, deadline, importance, difficulty) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [userId, title, deadline, importance, difficulty], (err, result) => {
    if (err) return res.status(500).json({ message: "Could not create task.", error: err.message });

    return res.status(201).json({
      message: "Task created successfully.",
      taskId: result.insertId,
    });
  });
};

// PUT /api/tasks/:id  — update a task
exports.updateTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, deadline, importance, difficulty, status } = req.body;

  // Make sure the task belongs to this user
  const checkOwner = "SELECT id FROM tasks WHERE id = ? AND user_id = ?";
  db.query(checkOwner, [taskId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Task not found." });

    const query =
      "UPDATE tasks SET title = ?, deadline = ?, importance = ?, difficulty = ?, status = ? WHERE id = ?";

    db.query(
      query,
      [title, deadline, importance, difficulty, status, taskId],
      (err) => {
        if (err) return res.status(500).json({ message: "Could not update task.", error: err.message });
        return res.status(200).json({ message: "Task updated successfully." });
      }
    );
  });
};

// DELETE /api/tasks/:id  — delete a task
exports.deleteTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  const checkOwner = "SELECT id FROM tasks WHERE id = ? AND user_id = ?";
  db.query(checkOwner, [taskId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Task not found." });

    const query = "DELETE FROM tasks WHERE id = ?";
    db.query(query, [taskId], (err) => {
      if (err) return res.status(500).json({ message: "Could not delete task.", error: err.message });
      return res.status(200).json({ message: "Task deleted successfully." });
    });
  });
};

// PATCH /api/tasks/:id/complete  — mark a task as completed
exports.markComplete = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  const checkOwner = "SELECT id FROM tasks WHERE id = ? AND user_id = ?";
  db.query(checkOwner, [taskId, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Task not found." });

    const query = "UPDATE tasks SET status = 'completed' WHERE id = ?";
    db.query(query, [taskId], (err) => {
      if (err) return res.status(500).json({ message: "Could not update task.", error: err.message });
      return res.status(200).json({ message: "Task marked as completed." });
    });
  });
};