const express = require("express");

const app = express();

app.use(express.json());

/**
 * ROOT CHECK
 */
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE");
});

/**
 * SIMPLE INVENTORY CHECK (optional debug)
 */
app.get("/inventory", (req, res) => {
    res.json({
        status: "inventory endpoint active"
    });
});

/**
 * WEBHOOK RECEIVER (FULL LOGGING + MEDIA DEBUG)
 */
app.post("/webhook", (req, res) => {

    const data = req.body;

    console.log("\n====================================");
    console.log("🔥 FULL VEHICLE + MEDIA PAYLOAD");
    console.log("====================================\n");

    console.log(JSON.stringify(data, null, 2));

    console.log("\n---------- CORE FIELDS ----------");
    console.log("ID:", data.id || "MISSING");
    console.log("TITLE:", data.title || "MISSING");
    console.log("STATUS:", data.status || "MISSING");
    console.log("PRICE:", data.price || "MISSING");
    console.log("MILEAGE:", data.mileage || "MISSING");
    console.log("YEAR:", data.year || "MISSING");
    console.log("MAKE:", data.make || "MISSING");
    console.log("MODEL:", data.model || "MISSING");

    console.log("\n---------- MEDIA ----------");

    // FEATURED IMAGE
    if (data.featured_image) {
        console.log("FEATURED IMAGE:", data.featured_image);
    } else {
        console.log("FEATURED IMAGE: NOT FOUND");
    }

    // GALLERY
    if (Array.isArray(data.gallery) && data.gallery.length > 0) {

        console.log("GALLERY COUNT:", data.gallery.length);

        data.gallery.forEach((img, index) => {
            console.log(`GALLERY [${index + 1}]`, img);
        });

    } else {
        console.log("GALLERY: EMPTY OR INVALID");
    }

    console.log("\n====================================\n");

    res.json({
        success: true,
        received: true,
        id: data.id || null
    });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
