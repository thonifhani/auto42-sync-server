const http = require("http");

let inventory = [];
let logs = [];

function send(res, status, data) {
    res.writeHead(status, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(JSON.stringify(data));
}

function addLog(entry) {
    logs.unshift({
        ...entry,
        time: new Date().toISOString()
    });
    if (logs.length > 50) logs.pop();
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => body += chunk);

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch (e) {
                reject(e);
            }
        });
    });
}

const server = http.createServer(async (req, res) => {

    const url = req.url || "";
    const method = req.method || "";

    if (method === "GET" && url === "/") {
        return send(res, 200, {
            status: "ACTIVE",
            inventory: inventory.length,
            logs: logs.length
        });
    }

    if (method === "GET" && url === "/inventory") {
        return send(res, 200, inventory);
    }

    if (method === "GET" && url === "/log") {
        return send(res, 200, logs);
    }

    if (method === "POST" && url === "/webhook") {

        try {
            const data = await parseBody(req);

            addLog({ type: "webhook", data });

            if (!data.id) {
                return send(res, 400, { error: "Missing id" });
            }

            if (data.event === "delete") {
                inventory = inventory.filter(v => v.id !== data.id);
                addLog({ type: "delete", id: data.id });
                return send(res, 200, { ok: true, event: "delete" });
            }

            // UPSERT SAFE
            inventory = inventory.filter(v => v.id !== data.id);

            inventory.push({
                id: data.id,
                title: data.title || "",
                price: data.price || "",
                mileage: data.mileage || "",
                year: data.year || "",
                make: data.make || "",
                model: data.model || "",
                featured_image: data.featured_image || null,
                gallery: Array.isArray(data.gallery) ? data.gallery : [],
                updated_at: new Date().toISOString()
            });

            addLog({ type: data.event === "update" ? "updated" : "created", id: data.id });

            return send(res, 200, {
                ok: true,
                action: "upsert",
                count: inventory.length
            });

        } catch (e) {
            return send(res, 400, { error: "Invalid JSON" });
        }
    }

    return send(res, 404, { error: "Not found" });
});

server.listen(process.env.PORT || 3031, () => {
    console.log("SYNC SERVER ACTIVE");
});
