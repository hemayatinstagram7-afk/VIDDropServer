const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "VIDDrop server is running"
    });
});

function detectPlatform(url) {

    try {

        const parsed =
            new URL(url);

        const host =
            parsed.hostname
                .toLowerCase()
                .replace(/^www\./, "");

        if (
            host === "youtube.com" ||
            host.endsWith(".youtube.com") ||
            host === "youtu.be"
        ) {
            return "YouTube";
        }

        if (
            host === "tiktok.com" ||
            host.endsWith(".tiktok.com")
        ) {
            return "TikTok";
        }

        if (
            host === "instagram.com" ||
            host.endsWith(".instagram.com")
        ) {
            return "Instagram";
        }

        if (
            host === "facebook.com" ||
            host.endsWith(".facebook.com") ||
            host === "fb.watch"
        ) {
            return "Facebook";
        }

        return "Unknown";

    } catch (error) {

        return "Unknown";
    }
}

app.post("/api/resolve", (req, res) => {

    const url = req.body.url;

    if (
        !url ||
        typeof url !== "string"
    ) {

        return res.status(400).json({
            success: false,
            message: "URL is required"
        });
    }

    const platform =
        detectPlatform(url);

    if (platform === "Unknown") {

        return res.status(400).json({
            success: false,
            message: "Unsupported URL"
        });
    }

    /*
     * This endpoint currently identifies
     * the platform only.
     *
     * It does NOT convert social-media
     * webpages into downloadable videos.
     */

    res.json({
        success: true,
        platform: platform,
        title: "VIDDrop Media",
        mediaUrl: url,
        message:
            platform +
            " URL detected successfully"
    });
});

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {
        console.log(
            `VIDDrop server running on port ${PORT}`
        );
    }
);
