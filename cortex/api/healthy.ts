// server.ts (example)
import http from "node:http";

const server = http.createServer((req, res) => {
    if (req.url === "/healthz") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, uptime: process.uptime() }));
        return;
    }
    // ...your normal routing
});

server.listen(3000, () => console.log("listening on :3000"));
