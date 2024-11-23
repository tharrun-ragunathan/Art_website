const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/imageDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define a schema and model
const imageSchema = new mongoose.Schema({
    imageLink: String,
});
const requestSchema = new mongoose.Schema({
    email: String,
    requesterName: String,
    requestType: String,
    message: String,
    dateSubmitted: { type: Date, default: Date.now }
});

const Request = mongoose.model("Request", requestSchema);
// Serve the request form
app.get("/request", (req, res) => {
    res.sendFile(path.join(__dirname, "public/request.html"));
});

// Handle request submission
app.post("/submit-request", async (req, res) => {
    const { artistName, requesterName, requestType, message } = req.body;

    if (!artistName || !requesterName || !requestType || !message) {
        return res.status(400).send("All fields are required");
    }

    try {
        await Request.create({
            artistName,
            requesterName,
            requestType,
            message
        });
        res.status(201).send("Request submitted successfully");
    } catch (err) {
        res.status(500).send("Error submitting request: " + err.message);
    }
});


const Image = mongoose.model("Image", imageSchema);

// Serve the upload page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/upload", (req, res) => {
    res.sendFile(path.join(__dirname, "upload.html"));
});
// Handle image upload
app.post("/upload", async (req, res) => {
    const { imageLink } = req.body;
    if (!imageLink) {
        return res.status(400).send("Image link is required");
    }

    try {
        await Image.create({ imageLink });
        res.status(201).send("Image uploaded successfully");
    } catch (err) {
        res.status(500).send("Error uploading image");
    }
});

// Route to fetch all images
app.get("/images", async (req, res) => {
    try {
        const images = await Image.find(); // Fetch all documents
        res.json(images); // Send the data as JSON
    } catch (err) {
        res.status(500).send("Error fetching images: " + err.message);
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
