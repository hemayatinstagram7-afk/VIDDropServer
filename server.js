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

function isDirectVideoUrl(url) {

    try {

        const clean =
            url
                .split("?")[0]
                .split("#")[0]
                .toLowerCase();

        return (
            clean.endsWith(".mp4") ||
            clean.endsWith(".webm") ||
            clean.endsWith(".mov") ||
            clean.endsWith(".mkv") ||
            clean.endsWith(".m4v") ||
            clean.endsWith(".3gp")
        );

    } catch (error) {

        return false;
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

    const trimmedUrl =
        url.trim();

    if (
        isDirectVideoUrl(
            trimmedUrl
        )
    ) {

        return res.json({
            success: true,
            platform: "Direct",
            title: "VIDDrop Video",
            mediaUrl: trimmedUrl
        });
    }

    const platform =
        detectPlatform(
            trimmedUrl
        );

    if (
        platform === "Unknown"
    ) {

        return res.status(400).json({
            success: false,
            message: "Unsupported URL"
        });
    }

    return res.json({
        success: false,
        platform: platform,
        message:
            platform +
            " URL detected, but a permitted media source/API is required to obtain a downloadable video."
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
