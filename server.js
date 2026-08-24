const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "VIDDrop server is running"
    });
});

app.post("/api/resolve", (req, res) => {

    const url = req.body.url;

    if (!url || typeof url !== "string") {
        return res.status(400).json({
            success: false,
            message: "URL is required"
        });
    }

    res.json({
        success: true,
        title: "VIDDrop Media",
        mediaUrl: url
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`VIDDrop server running on port ${PORT}`);
});
