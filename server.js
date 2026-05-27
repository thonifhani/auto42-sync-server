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
 * INVENTORY TEST (OPTIONAL SAFE VIEW)
 */
app.get("/inventory", (req, res) => {
    res.json({
        status: "inventory endpoint active"
    });
});

/**
 * WEBHOOK RECEIVER (FULL LOGGING MODE)
 */
app.post("/webhook", (req, res) => {

    const data = req.body;

    console.log("\n====================================");
    console.log("🔥 FULL VEHICLE PAYLOAD RECEIVED");
    console.log("====================================\n");

    console.log(JSON.stringify(data, null, 2));

    console.log("\n====================================");

    if (data.event === "upsert") {
        console.log("🟢 UPSERT VEHICLE ID:", data.id);
        console.log("TITLE:", data.title || "N/A");
        console.log("PRICE:", data.price || "N/A");
        console.log("MILEAGE:", data.mileage || "N/A");
        console.log("YEAR:", data.year || "N/A");
        console.log("MAKE:", data.make || "N/A");
        console.log("MODEL:", data.model || "N/A");
    }

    if (data.event === "delete") {
        console.log("🔴 DELETE VEHICLE ID:", data.id);
    }

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
