const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

// LOCAL MEMORY STORAGE
const listings = [];

// HEALTH CHECK
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE");
});

// VIEW STORED LISTINGS
app.get("/inventory", (req, res) => {
    res.json(listings);
});

// WEBHOOK RECEIVER
app.post("/webhook", async (req, res) => {

    try {

        console.log("🔥 Webhook received");

        const payload = req.body;

        if (!payload.id) {
            return res.status(400).json({
                error: "missing listing id"
            });
        }

        // FETCH FULL LISTING
        const api = await axios.get(
            `https://auto42.co.za/wp-json/wp/v2/listing/${payload.id}?_embed=1`
        );

        const wp = api.data;

        // NORMALIZE
        const vehicle = {
            external_id: wp.id,
            title: wp.title?.rendered || "",
            slug: wp.slug || "",
            link: wp.link || "",
            status: wp.status || "",

            image:
                wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,

            updated: new Date()
        };

        // REMOVE OLD VERSION
        const index = listings.findIndex(
            v => v.external_id === vehicle.external_id
        );

        if (index !== -1) {
            listings.splice(index, 1);
        }

        // INSERT CLEAN VERSION
        listings.push(vehicle);

        console.log("✅ Synced:", vehicle.title);

        res.json({
            success: true,
            vehicle
        });

    } catch (err) {

        console.log(err.message);

        res.status(500).json({
            error: "sync failed"
        });
    }
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
