const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Настройка статической папки для frontend
app.use("/src", express.static(path.join(__dirname, "src")));

// Подключение API роутеров
const booksRouter = require("./backend/api/books");
const usersRouter = require("./backend/api/users");
const rentedRouter = require("./backend/api/rented");

app.use("/api/books", booksRouter);
app.use("/api/users", usersRouter);
app.use("/api/rented", rentedRouter);

// Обработка главного роута
app.get("/", (req, res) => {
    res.send("Library API is running");
});

// Обработка 404 (если путь не найден)
app.use((req, res, next) => {
    res.status(404).json({ message: "API route not found" });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});