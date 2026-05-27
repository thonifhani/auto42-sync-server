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
 * INVENTORY (REAL DATA - NO DEMO STORAGE)
 * Pulls directly from WordPress Motors listing API
 */
app.get("/inventory", async (req, res) => {
    try {

        const response = await axios.get(
            "https://auto42.co.za/wp-json/wp/v2/listing?per_page=20&_embed=1"
        );

        const listings = response.data.map(wp => ({
            id: wp.id,
            title: wp.title?.rendered || "",
            slug: wp.slug || "",
            link: wp.link || "",
            status: wp.status || "",

            image:
                wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,

            price: wp.meta?.stm_car_price || null,
            mileage: wp.meta?.stm_car_mileage || null,

            updated_at: wp.modified || null
        }));

        res.json(listings);

    } catch (err) {
        console.log("INVENTORY ERROR:", err.message);
        res.status(500).json({ error: "failed to load inventory" });
    }
});

/**
 * WEBHOOK (REAL-TIME SINGLE LISTING SYNC)
 */
app.post("/webhook", async (req, res) => {

    try {

        const id = req.body.id;

        if (!id) {
            return res.status(400).json({ error: "missing listing id" });
        }

        // FETCH FULL LISTING FROM WORDPRESS
        const wpRes = await axios.get(
            `https://auto42.co.za/wp-json/wp/v2/listing/${id}?_embed=1`
        );

        const wp = wpRes.data;

        const vehicle = {
            id: wp.id,
            title: wp.title?.rendered || "",
            slug: wp.slug || "",
            link: wp.link || "",
            status: wp.status || "",

            image:
                wp._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,

            price: wp.meta?.stm_car_price || null,
            mileage: wp.meta?.stm_car_mileage || null,

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
