document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("search-form");
    const bookResults = document.getElementById("book-results");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("Please log in to access the catalog.");
        window.location.href = "profile.html";
        return;
    }

    const fetchBooks = async (queryParams = "") => {
        try {
            const response = await fetch(`http://localhost:3000/api/books${queryParams}`);
            const books = await response.json();

            bookResults.innerHTML = "";

            if (books.length > 0) {
                books.forEach((book) => {
                    const bookItem = document.createElement("div");
                    bookItem.classList.add("book-item");
                    bookItem.innerHTML = `
                        <h3>${book.title}</h3>
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Genre:</strong> ${book.genre}</p>
                        <button class="rent-button" data-book-id="${book.id}">Rent</button>
                    `;

                    const rentButton = bookItem.querySelector(".rent-button");
                    rentButton.addEventListener("click", () => rentBook(book.id));
                    bookResults.appendChild(bookItem);
                });
            } else {
                bookResults.innerHTML = "<p>No books found.</p>";
            }
        } catch (error) {
            console.error("Error fetching books:", error);
            bookResults.innerHTML = "<p>Error fetching books. Please try again later.</p>";
        }
    };

    const rentBook = async (bookId) => {
        try {
            const response = await fetch("http://localhost:3000/api/rented/rent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUser.id, book_id: bookId }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("Book successfully added to your profile!");
            } else {
                alert(result.message || "Failed to rent the book.");
            }
        } catch (error) {
            alert("Server error. Please try again later.");
        }
    };

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const genre = document.getElementById("genre").value.trim();

        const params = new URLSearchParams();
        if (title) params.append("title", title);
        if (author) params.append("author", author);
        if (genre) params.append("genre", genre);

        fetchBooks(`?${params.toString()}`);
    });

    fetchBooks();
});