const express = require("express");
const router = express.Router();
const db = require("../../db");

// Аренда книги
router.post("/rent", (req, res) => {
    const { user_id, book_id } = req.body;
    const borrow_date = new Date().toISOString().split("T")[0];

    if (!user_id || !book_id) {
        return res.status(400).json({ message: "User ID and Book ID are required" });
    }

    const bookCheckSql = "SELECT * FROM books WHERE id = ?";
    db.get(bookCheckSql, [book_id], (err, book) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }

        if (!book) {
            return res.status(404).json({ message: "Book with this ID does not exist" });
        }

        const checkSql = "SELECT * FROM borrowed_books WHERE user_id = ? AND book_id = ?";
        db.get(checkSql, [user_id, book_id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: "Internal server error" });
            }

            if (row) {
                return res.status(400).json({ message: "Book is already rented by this user" });
            }

            const insertSql = "INSERT INTO borrowed_books (user_id, book_id, borrow_date) VALUES (?, ?, ?)";
            db.run(insertSql, [user_id, book_id, borrow_date], function (err) {
                if (err) {
                    return res.status(500).json({ error: "Internal server error" });
                }
                res.status(201).json({ message: "Book rented successfully", rentalId: this.lastID });
            });
        });
    });
});

// Получение списка арендованных книг пользователя
router.get("/user/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT books.id as book_id, books.title, books.author, books.genre, borrowed_books.borrow_date
        FROM borrowed_books
        JOIN books ON borrowed_books.book_id = books.id
        WHERE borrowed_books.user_id = ?
    `;
    db.all(sql, [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(rows);
    });
});

// Возврат книги
router.post("/return", (req, res) => {
    const { user_id, book_id } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({ message: "User ID and Book ID are required" });
    }

    const sql = "DELETE FROM borrowed_books WHERE user_id = ? AND book_id = ?";
    db.run(sql, [user_id, book_id], function (err) {
        if (err) {
            return res.status(500).json({ error: "Internal server error" });
        }
        if (this.changes > 0) {
            res.status(200).json({ message: "Book returned successfully" });
        } else {
            res.status(404).json({ message: "No such borrowed book found" });
        }
    });
});

module.exports = router;