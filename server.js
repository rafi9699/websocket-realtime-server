const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
app.use(express.json());

const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocket.Server({ server });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected. Total:', clients.size);

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected. Total:', clients.size);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err.message);
    });
});

// Endpoint dipanggil PHP
app.post('/notify', (req, res) => {
    const { event, data } = req.body;
    const payload = JSON.stringify({ event, data });

    let sent = 0;
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
            sent++;
        }
    });

    console.log(`Event "${event}" dikirim ke ${sent} client`);
    res.json({ success: true, sent });
});

server.listen(3000, () => {
    console.log('WebSocket aktif di ws://localhost:3000');
    console.log('Notify endpoint: http://localhost:3000/notify');
});
