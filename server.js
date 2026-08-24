const express = require("express");

const app = express();

app.use(express.json());

const YOUTUBE_API_KEY =
    process.env.YOUTUBE_API_KEY;


/*
 * Detect social platform
 */

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


/*
 * Check direct video URL
 */

function isDirectVideoUrl(url) {

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
}


/*
 * Get YouTube video ID
 */

function getYouTubeVideoId(url) {

    try {

        const parsed =
            new URL(url);

        const host =
            parsed.hostname
                .toLowerCase()
                .replace(/^www\./, "");


        /*
         * youtube.com/watch?v=VIDEO_ID
         */

        if (
            host === "youtube.com" ||
            host.endsWith(".youtube.com")
        ) {

            const id =
                parsed.searchParams.get("v");

            if (id) {
                return id;
            }


            /*
             * youtube.com/shorts/VIDEO_ID
             */

            const parts =
                parsed.pathname
                    .split("/")
                    .filter(Boolean);

            const shortsIndex =
                parts.indexOf("shorts");

            if (
                shortsIndex !== -1 &&
                parts[shortsIndex + 1]
            ) {
                return parts[shortsIndex + 1];
            }
        }


        /*
         * youtu.be/VIDEO_ID
         */

        if (
            host === "youtu.be"
        ) {

            const id =
                parsed.pathname
                    .split("/")
                    .filter(Boolean)[0];

            if (id) {
                return id;
            }
        }

        return null;

    } catch (error) {

        return null;
    }
}


/*
 * YouTube metadata
 */

async function getYouTubeMetadata(url) {

    if (!YOUTUBE_API_KEY) {

        return {
            success: false,
            message:
                "YouTube API key is not configured on the server."
        };
    }

    const videoId =
        getYouTubeVideoId(url);

    if (!videoId) {

        return {
            success: false,
            message:
                "Could not find a YouTube video ID."
        };
    }

    try {

        const apiUrl =
            "https://www.googleapis.com/youtube/v3/videos" +
            "?part=snippet" +
            "&id=" +
            encodeURIComponent(videoId) +
            "&key=" +
            encodeURIComponent(YOUTUBE_API_KEY);

        const response =
            await fetch(apiUrl);

        const data =
            await response.json();

        if (!response.ok) {

            return {
                success: false,
                message:
                    data?.error?.message ||
                    "YouTube API request failed."
            };
        }

        if (
            !data.items ||
            data.items.length === 0
        ) {

            return {
                success: false,
                message:
                    "YouTube video was not found."
            };
        }

        const snippet =
            data.items[0].snippet;

        return {
            success: true,
            platform: "youtube",
            title:
                snippet.title ||
                "YouTube Video",
            thumbnail:
                snippet.thumbnails?.high?.url ||
                snippet.thumbnails?.default?.url ||
                "",
            videoId: videoId
        };

    } catch (error) {

        return {
            success: false,
            message:
                "Unable to contact YouTube API."
        };
    }
}


/*
 * Server status
 */

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "VIDDrop server is running"
    });
});


/*
 * Main resolver
 */

app.post("/api/resolve", async (req, res) => {

    const url = req.body.url;

    if (
        !url ||
        typeof url !== "string"
    ) {

        return res.status(400).json({
            success: false,
            message:
                "URL is required"
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
     * Direct MP4
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
     * Detect platform
     */

    const platform =
        detectPlatform(cleanUrl);


    if (
        platform === "invalid" ||
        platform === "unknown"
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Unsupported URL"
        });
    }


    /*
     * YouTube metadata
     */

    if (
        platform === "youtube"
    ) {

        const result =
            await getYouTubeMetadata(
                cleanUrl
            );

        return res.json(result);
    }


    /*
     * Other platforms
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
