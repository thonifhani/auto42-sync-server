const express = require("express");

const app = express();

app.use(express.json({ limit: "10mb" }));

/**
 * MEMORY STORE
 */
let inventory = [];

/**
 * HEALTH
 */
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE (IMAGE FIX MODE)");
});

/**
 * INVENTORY API
 */
app.get("/inventory", (req, res) => {
    res.json({
        success: true,
        total: inventory.length,
        data: inventory
    });
});

/**
 * WEBHOOK
 */
app.post("/webhook", (req, res) => {

    const data = req.body;

    if (!data || !data.id) {
        return res.status(400).json({ error: "invalid payload" });
    }

    console.log("\n====================");
    console.log("WEBHOOK EVENT:", data.event);
    console.log("ID:", data.id);
    console.log("TITLE:", data.title);
    console.log("====================\n");

    if (data.event === "upsert") {

        inventory = inventory.filter(v => v.id !== data.id);

        inventory.push({
            id: data.id,
            title: data.title || "",
            price: data.price || "",
            mileage: data.mileage || "",
            year: data.year || "",
            make: data.make || "",
            model: data.model || "",

            featured_image:
                data.featured_image ||
                "https://via.placeholder.com/800x600?text=No+Image",

            gallery: Array.isArray(data.gallery)
                ? data.gallery.filter(img => typeof img === "string" && img.length > 0)
                : ["https://via.placeholder.com/800x600?text=No+Gallery"],

            updated_at: new Date().toISOString()
        });

        console.log("UPSERT OK:", data.id);
    }

    if (data.event === "delete") {

        inventory = inventory.filter(v => v.id !== data.id);

        console.log("DELETE OK:", data.id);
    }

    res.json({
        success: true,
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
