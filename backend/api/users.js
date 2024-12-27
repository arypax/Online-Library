const express = require("express");
const router = express.Router();
const db = require("../../db");

// Регистрация пользователя
router.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.run(sql, [name, email, password], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint")) {
                return res.status(400).json({ message: "Email already exists" });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "User registered successfully", userId: this.lastID });
    });
});

// Авторизация пользователя
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.get(sql, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: "Database error." });
        }
        if (row) {
            res.json({ message: "Login successful", user: row });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    });
});

// Список арендованных книг
router.get("/rented/:userId", (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT books.title, books.author
        FROM borrowed_books
        INNER JOIN books ON borrowed_books.book_id = books.id
        WHERE borrowed_books.user_id = ?
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Failed to load rented books." });
        }
        res.json({ rentedBooks: rows });
    });
});

module.exports = router;