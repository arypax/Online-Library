document.addEventListener("DOMContentLoaded", () => {
    const authSection = document.getElementById("auth-section");
    const welcomeSection = document.getElementById("welcome-section");
    const authForm = document.getElementById("auth-form");
    const authMessage = document.getElementById("auth-message");
    const userName = document.getElementById("user-name");
    const userEmail = document.getElementById("user-email");
    const borrowedBooksList = document.getElementById("borrowed-books");
    const logoutButton = document.getElementById("logout-button");

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // Переключение отображения
    const toggleView = (isLoggedIn) => {
        if (isLoggedIn) {
            authSection.classList.add("hidden");
            welcomeSection.classList.remove("hidden");
        } else {
            authSection.classList.remove("hidden");
            welcomeSection.classList.add("hidden");
        }
    };

    // Рендеринг списка книг с кнопками возврата
    const renderBooks = (books) => {
        borrowedBooksList.innerHTML = "";
        if (books.length === 0) {
            borrowedBooksList.innerHTML = "<li>No books borrowed yet.</li>";
        } else {
            books.forEach(book => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    ${book.title} by ${book.author}
                    <button class="return-button" data-book-id="${book.book_id}">Return</button>
                `;
                const returnButton = listItem.querySelector(".return-button");
                returnButton.addEventListener("click", () => returnBook(book.book_id));
                borrowedBooksList.appendChild(listItem);
            });
        }
    };

    // Загрузка арендованных книг
    const loadBorrowedBooks = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/rented/user/${userId}`);
            const books = await response.json();
            if (response.ok) {
                renderBooks(books);
            } else {
                borrowedBooksList.innerHTML = "<li>Failed to load books.</li>";
            }
        } catch (error) {
            borrowedBooksList.innerHTML = "<li>Server error. Please try again later.</li>";
        }
    };

    // Возврат книги
    const returnBook = async (bookId) => {
        try {
            const response = await fetch("http://localhost:3000/api/rented/return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUser.id, book_id: bookId }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Book returned successfully!");
                loadBorrowedBooks(currentUser.id);
            } else {
                alert(result.message || "Failed to return the book.");
            }
        } catch (error) {
            alert("Server error. Please try again later.");
        }
    };

    // Проверка текущего пользователя
    if (currentUser) {
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email;
        toggleView(true);
        loadBorrowedBooks(currentUser.id);
    }

    // Авторизация
    authForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch("http://localhost:3000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();
            if (response.ok) {
                currentUser = result.user;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                userName.textContent = currentUser.name;
                userEmail.textContent = currentUser.email;
                toggleView(true);
                loadBorrowedBooks(currentUser.id);
            } else {
                authMessage.textContent = result.message || "Login failed.";
                authMessage.style.color = "red";
                authMessage.classList.remove("hidden");
            }
        } catch (error) {
            authMessage.textContent = "Server error. Please try again later.";
            authMessage.style.color = "red";
            authMessage.classList.remove("hidden");
        }
    });

    // Логика выхода
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        toggleView(false);
        alert("You have been logged out.");
    });
});