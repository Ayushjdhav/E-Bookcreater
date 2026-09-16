const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: { // Fixed spelling from "desciption"
        type: String,
        default: "",
    },
    content: {
        type: String,
        default: "",
    },
});

const bookSchema = new mongoose.Schema({
    userId: { // Fixed semicolon to colon
        type: mongoose.Schema.Types.ObjectId,
        required: true, // Fixed spelling from "requied"
        ref: "User",
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: { // Fixed spelling from "subtitile"
        type: String,
        default: "",
    },
    author: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
        default: "",
    },
    chapters: [chapterSchema],
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
}, { timestamps: true }); // Fixed missing parenthesis for new mongoose.Schema({

module.exports = mongoose.model("Book", bookSchema);