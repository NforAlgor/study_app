const db = require("../config/db");

// POST /api/planner/generate  — generate AI-prioritised study plan
exports.generatePlan = (req, res) => {
  const userId = req.user.id;

  // Fetch only pending/in-progress tasks for this user
  const query =
    "SELECT * FROM tasks WHERE user_id = ? AND status != 'completed' ORDER BY deadline ASC";

  db.query(query, [userId], (err, tasks) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    if (tasks.length === 0) {
      return res.status(200).json({ message: "No pending tasks found.", plan: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Score each task using the priority algorithm:
    // score = (deadline_weight * 0.5) + (difficulty * 0.3) + (importance * 0.2)
    // deadline_weight: how urgent the task is (closer deadline = higher score)
    const scoredTasks = tasks.map((task) => {
      const deadlineDate = new Date(task.deadline);
      const daysLeft = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)));

      // Urgency: tasks due sooner score higher (max 3, scaled down with more days)
      const deadlineWeight = Math.min(3, Math.ceil(10 / daysLeft));

      const score =
        deadlineWeight * 0.5 + task.difficulty * 0.3 + task.importance * 0.2;

      return {
        ...task,
        days_left: daysLeft,
        deadline_weight: deadlineWeight,
        score: parseFloat(score.toFixed(2)),
      };
    });

    // Sort by score descending (highest priority first)
    scoredTasks.sort((a, b) => b.score - a.score);

    // Add rank position
    const plan = scoredTasks.map((task, index) => ({
      rank: index + 1,
      id: task.id,
      title: task.title,
      deadline: task.deadline,
      days_left: task.days_left,
      importance: task.importance,
      difficulty: task.difficulty,
      status: task.status,
      score: task.score,
    }));

    return res.status(200).json({
      message: "Study plan generated successfully.",
      plan,
    });
  });
};