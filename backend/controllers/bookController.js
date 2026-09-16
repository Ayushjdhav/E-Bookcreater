const Book = require("../models/Book");

//@desc     Create a new book
//@route    POST /api/books
//@access   Private
const createBook = async (req, res) => {
    try {
        const { title, subtitle, author, chapters } = req.body;

        if (!title || !author) {
            return res.status(400).json({ message: "Please provide both a book title and an author name" });
        }

        const book = await Book.create({
            user: req.user._id,
            title,
            subtitle: subtitle || "",
            author,
            chapters: chapters && chapters.length > 0 ? chapters : [{ title: "Chapter 1", content: "", order: 1 }],
        });

        res.status(201).json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc     Get all books for a user
//@route    GET /api/books
//@access   Private
const getBooks = async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc     Get a single book by ID
//@route    GET /api/books/:id
//@access   Private
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to view this book" });
        }

        res.json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc     Delete a Book
//@route    DELETE /api/books/:id
//@access   Private
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this book" });
        }

        await book.deleteOne();
        res.json({ message: "Book removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc     Update a Book (title, subtitle, author, chapters)
//@route    PUT /api/books/:id
//@access   Private
const updateBook = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to update this book" });
        }

        book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

//@desc     Update a book's cover image
//@route    PUT /api/books/cover/:id
//@access   Private
const updateBookCover = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to update this book" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image file" });
        }

        book.coverImage = `/${req.file.path}`;
        await book.save();

        res.json({
            message: "Cover image updated successfully",
            coverImage: book.coverImage,
            book,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    updateBookCover,
    deleteBook,
};