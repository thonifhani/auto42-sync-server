const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Auto42 Sync Server Running");
});

app.post("/webhook", (req, res) => {
    console.log("Received:", req.body);

    res.json({
        success: true,
        message: "received"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
