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

// Define schemas and models
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

const Image = mongoose.model("Image", imageSchema);
const Request = mongoose.model("Request", requestSchema);

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Handle login submission and redirect
app.post('/login', (req, res) => {
    const { role } = req.body;

    // Validate the role
    if (!['admin', 'user', 'artist'].includes(role)) {
        return res.status(400).send('Invalid role');
    }

    // Redirect to the corresponding page
    switch (role) {
        case 'admin':
            return res.redirect('/admin');
        case 'user':
            return res.redirect('/user');
        case 'artist':
            return res.redirect('/artist');
        default:
            res.status(400).send('Invalid role');
    }
});

// Serve admin, user, and artist pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/user.html'));
});

app.get('/artist', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/artist.html'));
});

// Serve request and upload pages
app.get('/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/request.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

// Fetch all requests (for admin)
app.get('/requests', async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (err) {
        res.status(500).send('Error fetching requests');
    }
});

// Delete a specific request (for admin)
app.delete('/requests/:id', async (req, res) => {
    try {
        await Request.findByIdAndDelete(req.params.id);
        res.status(200).send('Request deleted');
    } catch (err) {
        res.status(500).send('Error deleting request');
    }
});

// Handle request submissions
app.post("/submit-request", async (req, res) => {
    const { artistName, requesterName, requestType, message } = req.body;

    // Validate the input fields
    if (!artistName || !requesterName || !requestType || !message) {
        return res.status(400).send("All fields are required");
    }

    try {
        // Create a new request in the database
        await Request.create({
            artistName,
            requesterName,
            requestType,
            message
        });

        // Send a styled success response
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
                        background-color: antiquewhite;
                        padding: 20px;
                        margin: 0;
                    }

                    h1 {
                        color: #4CAF50;
                        margin-top: 50px;
                    }

                    p {
                        color: #333;
                        font-size: 18px;
                        margin: 20px 0;
                    }

                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        border: none;
                        border-radius: 4px;
                        background-color: #4CAF50;
                        color: white;
                        cursor: pointer;
                        margin-top: 20px;
                    }

                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <h1>Request Submitted Successfully!</h1>
                <p>Your request has been received. Thank you for submitting.</p>
                <button onclick="window.location.href='/user'">Back to User Dashboard</button>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Error submitting request: " + err.message);
    }
});


// Handle image uploads
app.post("/upload", async (req, res) => {
    const { imageLink } = req.body;

    // Validate the input field
    if (!imageLink) {
        return res.status(400).send("Image link is required");
    }

    try {
        // Save the image to the database
        await Image.create({ imageLink });

        // Send a styled success response
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Image Uploaded</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: antiquewhite;
                        padding: 20px;
                        margin: 0;
                    }

                    h1 {
                        color: #4CAF50;
                        margin-top: 50px;
                    }

                    p {
                        color: #333;
                        font-size: 18px;
                        margin: 20px 0;
                    }

                    button {
                        padding: 10px 20px;
                        font-size: 16px;
                        border: none;
                        border-radius: 4px;
                        background-color: #4CAF50;
                        color: white;
                        cursor: pointer;
                        margin-top: 20px;
                    }

                    button:hover {
                        background-color: #45a049;
                    }
                </style>
            </head>
            <body>
                <h1>Image Uploaded Successfully!</h1>
                <p>Your image has been successfully uploaded. Thank you for your contribution!</p>
                <button onclick="window.location.href='/artist'">Back to Artist Dashboard</button>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send("Error uploading image: " + err.message);
    }
});


// Fetch all images
app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (err) {
        res.status(500).send("Error fetching images: " + err.message);
    }
});

// Serve the index page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
