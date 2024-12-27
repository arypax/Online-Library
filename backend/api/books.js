const express = require("express");
const router = express.Router();
const db = require("../../db");

// Получение списка всех книг с фильтрацией
router.get("/", (req, res) => {
    const { title, author, genre, availability } = req.query;

    let sql = `
        SELECT books.id, books.title, books.author, books.genre, books.language, -- Добавлено поле language
        CASE 
            WHEN borrowed_books.book_id IS NULL THEN 'available'
            WHEN borrowed_books.return_date IS NOT NULL THEN 'available'
            ELSE 'unavailable'
        END AS availability
        FROM books
        LEFT JOIN (
            SELECT book_id, MAX(return_date) AS return_date
            FROM borrowed_books
            WHERE return_date IS NULL OR return_date >= DATE('now')
            GROUP BY book_id
        ) AS borrowed_books ON books.id = borrowed_books.book_id
    `;
    const conditions = [];
    const values = [];

    // Добавляем фильтры
    if (title) {
        conditions.push("books.title LIKE ? COLLATE NOCASE"); // Используем COLLATE NOCASE
        values.push(`%${title}%`);
    }
    if (author) {
        conditions.push("books.author LIKE ? COLLATE NOCASE"); // Используем COLLATE NOCASE
        values.push(`%${author}%`);
    }
    if (genre) {
        conditions.push("books.genre LIKE ? COLLATE NOCASE"); // Используем COLLATE NOCASE
        values.push(`%${genre}%`);
    }
    if (availability === "available") {
        conditions.push(`
            (borrowed_books.book_id IS NULL OR borrowed_books.return_date IS NOT NULL)
        `);
    } else if (availability === "unavailable") {
        conditions.push(`
            borrowed_books.book_id IS NOT NULL AND borrowed_books.return_date IS NULL
        `);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    console.log("SQL Query:", sql);
    console.log("Values:", values);

    db.all(sql, values, (err, rows) => {
        if (err) {
            console.error("Error fetching books:", err.message);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(rows);
    });
});

module.exports = router;