const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("SYNC TEST LIVE");
});

app.get("/inventory", (req, res) => {
    res.json({ ok: true, count: 0 });
});

app.post("/webhook", (req, res) => {
    console.log("WEBHOOK HIT:");
    console.log(req.body);

    res.json({ received: true });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("SERVER RUNNING");
});
