const db = require("./db");

db.serialize(() => {
    console.log("Setting up the database...");

    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            genre TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS borrowed_books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            borrow_date TEXT NOT NULL,
            return_date TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(book_id) REFERENCES books(id)
        )
    `);

    console.log("Database setup completed.");
});
