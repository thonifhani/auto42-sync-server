const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

/**
 * ROOT TEST
 */
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE");
});

/**
 * INVENTORY TEST
 * (Safe basic version)
 */
app.get("/inventory", async (req, res) => {

    try {

        const response = await axios.get(
            "https://auto42.co.za/wp-json/wp/v2/listings?per_page=5"
        );

        const listings = response.data;

        const clean = listings.map(item => ({
            id: item.id,
            title: item.title?.rendered || "",
            slug: item.slug || "",
            link: item.link || "",
            status: item.status || "",
            modified: item.modified || ""
        }));

        res.json({
            success: true,
            total: clean.length,
            listings: clean
        });

    } catch (err) {

        console.log("INVENTORY ERROR:");
        console.log(err.message);

        res.status(500).json({
            error: "failed to load inventory"
        });
    }
});

/**
 * REAL-TIME WEBHOOK RECEIVER
 */
app.post("/webhook", (req, res) => {

    const data = req.body;

    console.log("=================================");
    console.log("EVENT RECEIVED:");
    console.log(data);
    console.log("=================================");

    if (data.event === "upsert") {
        console.log("UPSERT LISTING:", data.id);
    }

    if (data.event === "delete") {
        console.log("DELETE LISTING:", data.id);
    }

    res.json({
        success: true,
        received: data
    });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
