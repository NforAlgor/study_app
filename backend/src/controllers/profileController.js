const db = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/profile  — get logged-in user's profile + task stats
exports.getProfile = (req, res) => {
  const userId = req.user.id;

  const userQuery = "SELECT id, name, email, created_at FROM users WHERE id = ?";
  db.query(userQuery, [userId], (err, userResults) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (userResults.length === 0) return res.status(404).json({ message: "User not found." });

    const statsQuery = `
      SELECT
        COUNT(*) AS total_tasks,
        SUM(status = 'completed')   AS completed_tasks,
        SUM(status = 'pending')     AS pending_tasks,
        SUM(status = 'in_progress') AS in_progress_tasks
      FROM tasks WHERE user_id = ?
    `;

    db.query(statsQuery, [userId], (err, statsResults) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err.message });

      return res.status(200).json({
        user: userResults[0],
        stats: statsResults[0],
      });
    });
  });
};

// PUT /api/profile  — update name or email
exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required." });
  }

  // Check email not taken by another user
  const checkEmail = "SELECT id FROM users WHERE email = ? AND id != ?";
  db.query(checkEmail, [email, userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });
    if (results.length > 0) return res.status(409).json({ message: "Email already in use." });

    const query = "UPDATE users SET name = ?, email = ? WHERE id = ?";
    db.query(query, [name, email, userId], (err) => {
      if (err) return res.status(500).json({ message: "Could not update profile.", error: err.message });
      return res.status(200).json({ message: "Profile updated successfully." });
    });
  });
};

// PUT /api/profile/password  — change password
exports.changePassword = (req, res) => {
  const userId = req.user.id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ message: "Both current and new password are required." });
  }

  const findUser = "SELECT password FROM users WHERE id = ?";
  db.query(findUser, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    const isMatch = bcrypt.compareSync(current_password, results[0].password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect." });

    const hashed = bcrypt.hashSync(new_password, 10);
    const query = "UPDATE users SET password = ? WHERE id = ?";
    db.query(query, [hashed, userId], (err) => {
      if (err) return res.status(500).json({ message: "Could not change password.", error: err.message });
      return res.status(200).json({ message: "Password changed successfully." });
    });
  });
};