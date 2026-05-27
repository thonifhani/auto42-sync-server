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
 * INVENTORY DEBUG (SAFE + FULL ERROR VISIBILITY)
 * Purpose: identify why WordPress sync fails
 */
app.get("/inventory", async (req, res) => {

    try {

        const url = "https://auto42.co.za/wp-json/wp/v2/listings?per_page=1";

        console.log("FETCHING WORDPRESS:", url);

        const response = await axios.get(url);

        console.log("STATUS:", response.status);

        return res.json({
            success: true,
            endpoint: url,
            count: Array.isArray(response.data) ? response.data.length : 0,
            sample: response.data?.[0] || null
        });

    } catch (err) {

        console.log("========== WORDPRESS ERROR ==========");
        console.log("STATUS:", err.response?.status);
        console.log("DATA:", err.response?.data);
        console.log("MESSAGE:", err.message);
        console.log("====================================");

        return res.status(500).json({
            error: "failed to load inventory",
            debug: {
                status: err.response?.status || null,
                message: err.message
            }
        });
    }
});

/**
 * WEBHOOK DEBUG (SAFE SINGLE LISTING FETCH)
 */
app.post("/webhook", async (req, res) => {

    try {

        const id = req.body.id;

        if (!id) {
            return res.status(400).json({ error: "missing id" });
        }

        const url = `https://auto42.co.za/wp-json/wp/v2/listings/${id}`;

        console.log("WEBHOOK FETCH:", url);

        const wpRes = await axios.get(url);

        const wp = wpRes.data;

        const vehicle = {
            id: wp.id,
            title: wp.title?.rendered || "",
            link: wp.link || "",
            slug: wp.slug || "",
            status: wp.status || "",
            updated_at: new Date()
        };

        console.log("SYNC OK:", vehicle.title);

        res.json({
            success: true,
            vehicle
        });

    } catch (err) {

        console.log("WEBHOOK ERROR:", err.message);

        res.status(500).json({
            error: "sync failed",
            debug: err.response?.data || err.message
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
