const express = require("express");

const app = express();

app.use(express.json());

/**
 * SIMPLE MEMORY STORAGE
 */
let inventory = [];

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
    res.send("Auto42 Sync Server LIVE (NO DB MODE)");
});

/**
 * GET INVENTORY (LIVE MEMORY)
 */
app.get("/inventory", (req, res) => {
    res.json({
        success: true,
        total: inventory.length,
        data: inventory
    });
});

/**
 * WEBHOOK RECEIVER
 */
app.post("/webhook", (req, res) => {

    const data = req.body;

    console.log("EVENT:", data.event, "ID:", data.id);

    if (data.event === "upsert") {

        // remove duplicates
        inventory = inventory.filter(v => v.id !== data.id);

        // add updated record
        inventory.push(data);

        console.log("UPSERT DONE:", data.id);
    }

    if (data.event === "delete") {

        inventory = inventory.filter(v => v.id !== data.id);

        console.log("DELETE DONE:", data.id);
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
    console.log("🚀 Server running on port", PORT);
});
