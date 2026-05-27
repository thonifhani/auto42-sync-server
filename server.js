const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("WEBHOOK TEST ACTIVE");
});

app.post("/webhook", (req, res) => {
    console.log("🔥 WEBHOOK HIT:");
    console.log(req.body);

    res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("SERVER RUNNING");
});
