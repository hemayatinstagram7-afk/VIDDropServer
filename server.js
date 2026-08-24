const express = require("express");

const app = express();

app.use(express.json());

function detectPlatform(url) {

    try {

        const host =
            new URL(url)
                .hostname
                .toLowerCase()
                .replace(/^www\./, "");

        if (
            host === "youtube.com" ||
            host.endsWith(".youtube.com") ||
            host === "youtu.be"
        ) {
            return "youtube";
        }

        if (
            host === "tiktok.com" ||
            host.endsWith(".tiktok.com")
        ) {
            return "tiktok";
        }

        if (
            host === "instagram.com" ||
            host.endsWith(".instagram.com")
        ) {
            return "instagram";
        }

        if (
            host === "facebook.com" ||
            host.endsWith(".facebook.com") ||
            host === "fb.watch"
        ) {
            return "facebook";
        }

        return "unknown";

    } catch (error) {

        return "invalid";
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


/*
 * Server status
 */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "VIDDrop server is running"
    });
});


/*
 * Main resolver
 */

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

    const cleanUrl =
        url.trim();

    if (
        !/^https?:\/\//i.test(cleanUrl)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Only HTTP/HTTPS URLs are supported"
        });
    }


    /*
     * Direct video URL
     */

    if (
        isDirectVideoUrl(cleanUrl)
    ) {

        return res.json({
            success: true,
            platform: "direct",
            title: "VIDDrop Video",
            mediaUrl: cleanUrl
        });
    }


    /*
     * Detect social platform
     */

    const platform =
        detectPlatform(cleanUrl);

    if (
        platform === "unknown" ||
        platform === "invalid"
    ) {

        return res.status(400).json({
            success: false,
            message: "Unsupported URL"
        });
    }


    /*
     * Social media detected.
     *
     * We don't return the webpage URL
     * as mediaUrl because it is not an
     * actual video file.
     */

    return res.json({
        success: false,
        platform: platform,
        message:
            "Platform detected. An authorized media provider is required."
    });
});


/*
 * Start server
 */

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
