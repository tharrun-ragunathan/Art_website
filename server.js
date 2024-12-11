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
    views: { type: Number, default: 0 }, // Track the number of views
});

const requestSchema = new mongoose.Schema({
    artistName: { type: String, required: true },
    requesterName: { type: String, required: true },
    requestType: { type: String, required: true },
    message: { type: String, required: true },
    dateSubmitted: { type: Date, default: Date.now },
});

const Image = mongoose.model("Image", imageSchema);
const Request = mongoose.model("Request", requestSchema);

// Route to serve index.html (Gallery)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Request route
app.get("/request", (req, res) => {
    res.sendFile(path.join(__dirname, "public/request.html"));
});

// Request submission
app.post("/submit-request", async (req, res) => {
    const { artistName, requesterName, requestType, message } = req.body;

    if (!artistName || !requesterName || !requestType || !message) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const newRequest = new Request({
            artistName,
            requesterName,
            requestType,
            message,
        });

        await newRequest.save();

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Request Submitted</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: #f5f5f5;
                        padding: 50px;
                    }

                    h1 {
                        color: #4CAF50;
                    }

                    p {
                        font-size: 18px;
                        color: #333;
                    }

                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        border: none;
                        border-radius: 5px;
                        background-color: #4CAF50;
                        color: white;
                        cursor: pointer;
                    }

                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <h1>Request Submitted Successfully!</h1>
                <p>Your request has been sent to the artist.</p>
                <button onclick="window.location.href='/user'">Back to Dashboard</button>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Error submitting request: " + err.message);
    }
});

// Route to fetch all requests
app.get("/requests", async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (err) {
        res.status(500).send("Error fetching requests: " + err.message);
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

// Route to increment the view count for an image
app.post("/images/:id/view", async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).send("Image not found");
        }

        image.views += 1; // Increment the views count
        await image.save();

        res.status(200).send("View count incremented");
    } catch (err) {
        res.status(500).send("Error incrementing view count: " + err.message);
    }
});


// Other routes (upload, artist, admin, user, login, etc.)
app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "public/upload.html"));
});

app.get("/artist", (req, res) => {
    res.sendFile(path.join(__dirname, "public/artist.html"));
});

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.get("/user", (req, res) => {
    res.sendFile(path.join(__dirname, "public/user.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});


// Route to handle image uploads
app.post("/upload", async (req, res) => {
    const { imageLink, title, description, comments } = req.body;

    if (!imageLink || !title || !description) {
        return res.status(400).send("Image link, title, and description are required.");
    }

    try {
        const commentArray = comments
            ? comments.split(",").map((comment) => comment.trim())
            : [];
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

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
