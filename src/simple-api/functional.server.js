// src/simple-api/functional.server.js

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const JWT_SECRET = "jdljfldalfjldflafdflaf"; // In production, use environment variables

// In-memory data stoers

let users = []; // {id, name, email, passwordHash}
let posts = []; // {id, userId, content}

// Helper: authenticate middleware

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid Authorization format" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // attach decoded user info
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// AUTH ROUTES

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Basic VAlidation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Requires unique email
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "Email already in use." });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1, // In a real app, use UUID or database-generated ID
    name,
    email,
    passwordHash,
  };
  users.push(newUser);
  res.status(201).json({ message: "User registered successfully" });
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Basic Validation
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// GET PROFILE (protected)
app.get("/api/auth/profile", authenticate, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

// POSTS ROUTES

// CREATE POST (protected)
app.post("/api/auth/posts", authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }
  const newPost = {
    id: posts.length + 1, // In real app, use UUID or database-generated ID
    userId: req.user.id,
    content,
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Default 404
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
