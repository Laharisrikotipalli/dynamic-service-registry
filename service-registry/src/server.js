const express = require("express");

const app = express();
app.use(express.json());

const services = {};
const HEARTBEAT_TIMEOUT = 30000;


app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});


app.post("/registry/register", (req, res) => {
  const { serviceName, host, port } = req.body;

  if (!serviceName || !host || !port) {
    return res.status(400).json({ error: "Invalid data" });
  }

  if (!services[serviceName]) {
    services[serviceName] = [];
  }

  const exists = services[serviceName].find(
    s => s.host === host && s.port === Number(port)
  );

  if (!exists) {
    services[serviceName].push({
      serviceName,
      host,
      port: Number(port),
      lastHeartbeat: Date.now()
    });

    console.log(`Registered: ${serviceName} -> ${host}:${port}`);
  }

  res.json({ status: "registered" });
});


app.post("/registry/heartbeat", (req, res) => {
  const { serviceName, host, port } = req.body;

  const instance = (services[serviceName] || []).find(
    s => s.host === host && s.port === Number(port)
  );

  if (instance) {
    instance.lastHeartbeat = Date.now();
  }

  res.json({ status: "heartbeat_received" });
});


app.post("/registry/deregister", (req, res) => {
  const { serviceName, host, port } = req.body;

  services[serviceName] =
    (services[serviceName] || []).filter(
      s => !(s.host === host && s.port === Number(port))
    );

  res.json({ status: "deregistered" });
});


app.get("/registry/services/:serviceName", (req, res) => {
  const healthy = (services[req.params.serviceName] || []).filter(
    s => Date.now() - s.lastHeartbeat < HEARTBEAT_TIMEOUT
  );

  res.json(healthy);
});


setInterval(() => {
  for (let service in services) {
    services[service] = services[service].filter(
      s => Date.now() - s.lastHeartbeat < HEARTBEAT_TIMEOUT
    );

    if (services[service].length === 0) {
      delete services[service];
    }
  }
}, 5000);

app.listen(8500, () => {
  console.log("Service Registry running on port 8500");
});