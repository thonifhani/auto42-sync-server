const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE");
});

/**
 * INVENTORY (REAL WORDPRESS DATA ONLY)
 * Motors CPT: listings
 */
app.get("/inventory", async (req, res) => {

    try {

        // GET LISTINGS
        const listingsRes = await axios.get(
            "https://auto42.co.za/wp-json/wp/v2/listings?per_page=20&_embed=1"
        );

        const listings = listingsRes.data;

        const result = await Promise.all(listings.map(async (wp) => {

            // FEATURE IMAGE
            let image =
                wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

            // GALLERY (MEDIA ATTACHMENTS)
            let gallery = [];

            try {
                const mediaRes = await axios.get(
                    `https://auto42.co.za/wp-json/wp/v2/media?parent=${wp.id}`
                );

                gallery = mediaRes.data.map(m => m.source_url);

            } catch (e) {
                // ignore gallery errors
            }

            return {
                id: wp.id,
                title: wp.title?.rendered || "",
                slug: wp.slug || "",
                link: wp.link || "",
                status: wp.status || "",

                image,
                gallery,

                // NOTE: Motors meta NOT exposed in REST API
                price: null,
                mileage: null,
                year: null,
                make: null,
                model: null,

                updated_at: wp.modified || null
            };
        }));

        res.json(result);

    } catch (err) {
        console.log("INVENTORY ERROR:", err.message);

        res.status(500).json({
            error: "failed to load inventory"
        });
    }
});

/**
 * WEBHOOK (REAL-TIME SINGLE LISTING SYNC)
 */
app.post("/webhook", async (req, res) => {

    try {

        const id = req.body.id;

        if (!id) {
            return res.status(400).json({ error: "missing id" });
        }

        // GET SINGLE LISTING
        const wpRes = await axios.get(
            `https://auto42.co.za/wp-json/wp/v2/listings/${id}?_embed=1`
        );

        const wp = wpRes.data;

        let image =
            wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

        let gallery = [];

        try {
            const mediaRes = await axios.get(
                `https://auto42.co.za/wp-json/wp/v2/media?parent=${id}`
            );

            gallery = mediaRes.data.map(m => m.source_url);

        } catch (e) {}

        const vehicle = {
            id: wp.id,
            title: wp.title?.rendered || "",
            slug: wp.slug || "",
            link: wp.link || "",

            image,
            gallery,

            price: null,
            mileage: null,
            year: null,

            synced_at: new Date()
        };

        console.log("SYNCED:", vehicle.title);

        res.json({
            success: true,
            vehicle
        });

    } catch (err) {

        console.log("WEBHOOK ERROR:", err.message);

        res.status(500).json({
            error: "sync failed"
        });
    }
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Server running on port", PORT);
});
