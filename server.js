const express = require("express");

const app = express();

app.use(express.json({ limit: "10mb" }));

/**
 * MEMORY INVENTORY STORE
 * (temporary storage - no database)
 */
let inventory = [];

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE (CLEAN MODE)");
});

/**
 * GET INVENTORY
 */
app.get("/inventory", (req, res) => {
    res.json({
        success: true,
        total: inventory.length,
        data: inventory
    });
});

/**
 * WEBHOOK RECEIVER (WORDPRESS → NODE)
 */
app.post("/webhook", (req, res) => {

    const data = req.body;

    // BASIC VALIDATION
    if (!data || !data.id) {
        return res.status(400).json({
            success: false,
            error: "Invalid payload - missing ID"
        });
    }

    console.log("\n==============================");
    console.log("🔥 WEBHOOK RECEIVED");
    console.log("==============================");

    console.log("EVENT:", data.event || "unknown");
    console.log("ID:", data.id);
    console.log("TITLE:", data.title || "no title");

    console.log("FEATURED IMAGE:", data.featured_image || "missing");

    if (Array.isArray(data.gallery)) {
        console.log("GALLERY COUNT:", data.gallery.length);
    } else {
        console.log("GALLERY: empty or invalid");
    }

    console.log("==============================\n");

    /**
     * UPSERT (CREATE / UPDATE)
     */
    if (data.event === "upsert") {

        // remove duplicates
        inventory = inventory.filter(item => item.id !== data.id);

        // insert fresh record
        inventory.push({
            id: data.id,
            title: data.title || "",
            price: data.price || "",
            mileage: data.mileage || "",
            year: data.year || "",
            make: data.make || "",
            model: data.model || "",

            fuel: data.fuel || "",
            transmission: data.transmission || "",
            body: data.body || "",

            featured_image: data.featured_image || null,
            gallery: Array.isArray(data.gallery) ? data.gallery : [],

            status: data.status || "publish",
            updated_at: new Date().toISOString()
        });

        console.log("✅ UPSERT SUCCESS:", data.id);
    }

    /**
     * DELETE
     */
    if (data.event === "delete") {

        inventory = inventory.filter(item => item.id !== data.id);

        console.log("🗑 DELETE SUCCESS:", data.id);
    }

    /**
     * RESPONSE
     */
    res.json({
        success: true,
        received: true,
        total: inventory.length
    });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Auto42 Server Running on port", PORT);
});
