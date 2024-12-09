const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/imageDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define schemas and models
const imageSchema = new mongoose.Schema({
    imageLink: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    comments: { type: [String], default: [] },
});

const Image = mongoose.model("Image", imageSchema);

// Route to serve index.html (Gallery)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Route to serve upload.html
app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "public/upload.html"));
});

// Route to serve artist.html
app.get("/artist", (req, res) => {
    res.sendFile(path.join(__dirname, "public/artist.html"));
});

// Route to serve admin.html
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

// Route to serve user.html
app.get("/user", (req, res) => {
    res.sendFile(path.join(__dirname, "public/user.html"));
});

// Route to handle login with role-based redirection
app.get("/login", (req, res) => {
    const role = req.query.role;

    // Redirect based on the role
    if (role === "admin") {
        res.redirect("/admin"); // Admin dashboard
    } else if (role === "user") {
        res.redirect("/user"); // User dashboard
    } else if (role === "artist") {
        res.redirect("/artist"); // Artist dashboard
    } else {
        res.status(400).send("Invalid role. Please select a valid role.");
    }
});

// Route to handle image uploads
app.post("/upload", async (req, res) => {
    const { imageLink, title, description, comments } = req.body;

    if (!imageLink || !title || !description) {
        return res.status(400).send("Image link, title, and description are required.");
    }

    try {
        const commentArray = comments ? comments.split(",").map(comment => comment.trim()) : [];
        await Image.create({ imageLink, title, description, comments: commentArray });

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Image Uploaded Successfully</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background: linear-gradient(to right, #92a8d1, #f7cac9);
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        color: #333;
                    }

                    .container {
                        background-color: #fff;
                        padding: 30px 40px;
                        border-radius: 10px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        text-align: center;
                        max-width: 500px;
                        width: 90%;
                    }

                    h1 {
                        font-size: 28px;
                        color: #4CAF50;
                        margin-bottom: 20px;
                    }

                    p {
                        font-size: 18px;
                        margin: 10px 0 20px;
                        color: #555;
                    }

                    button {
                        background-color: #4CAF50;
                        color: white;
                        padding: 12px 20px;
                        font-size: 16px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        transition: background-color 0.3s ease;
                    }

                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Image Uploaded Successfully!</h1>
                    <p>Your image has been uploaded with the provided details.</p>
                    <button onclick="window.location.href='/artist'">Back to Artist Dashboard</button>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Error uploading image: " + err.message);
    }
});

// Route to fetch all images
app.get("/images", async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (err) {
        res.status(500).send("Error fetching images: " + err.message);
    }
});

// Route to edit an image
app.put("/images/:id", async (req, res) => {
    const { title, description, comments } = req.body;

    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).send("Image not found");
        }

        image.title = title || image.title;
        image.description = description || image.description;
        image.comments = comments ? comments.split(",").map(c => c.trim()) : image.comments;

        await image.save();
        res.status(200).send("Image updated successfully");
    } catch (err) {
        res.status(500).send("Error updating image: " + err.message);
    }
});

// Route to delete an image
app.delete("/images/:id", async (req, res) => {
    try {
        const image = await Image.findByIdAndDelete(req.params.id);

        if (!image) {
            return res.status(404).send("Image not found");
        }

        res.status(200).send("Image deleted successfully");
    } catch (err) {
        res.status(500).send("Error deleting image: " + err.message);
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
