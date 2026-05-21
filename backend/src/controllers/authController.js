const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// POST /api/auth/register
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const checkEmail = "SELECT id FROM users WHERE email = ?";
  db.query(checkEmail, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    if (results.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const insertUser = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(insertUser, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: "Could not register user.", error: err.message });

      return res.status(201).json({ message: "Registration successful." });
    });
  });
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const findUser = "SELECT * FROM users WHERE email = ?";
  db.query(findUser, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  });
};