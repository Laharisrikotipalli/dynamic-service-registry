const express = require("express");

const app = express();
app.use(express.json());

const services = {};
const HEARTBEAT_TIMEOUT = 30000;


// REGISTER SERVICE
app.post("/registry/register", (req, res) => {

  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" })
  }

  const { serviceName, host, port } = req.body

  if (!serviceName || !host || !port) {
    return res.status(400).json({ error: "Invalid service registration data" })
  }

  if (!services[serviceName]) {
    services[serviceName] = []
  }

  const existing = services[serviceName].find(
    s => s.host === host && s.port === Number(port)
  )

  if (!existing) {
    services[serviceName].push({
      serviceName,
      host,
      port: Number(port),
      lastHeartbeat: Date.now()
    })
  }

  res.json({ status: "registered" })
})

// HEARTBEAT
app.post("/registry/heartbeat", (req, res) => {

  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" })
  }

  const { serviceName, host, port } = req.body

  const instance = (services[serviceName] || []).find(
    s => s.host === host && s.port === Number(port)
  )

  if (instance) {
    instance.lastHeartbeat = Date.now()
  }

  res.json({ status: "heartbeat_received" })
})
// DEREGISTER
app.post("/registry/deregister", (req, res) => {

  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" })
  }

  const { serviceName, host, port } = req.body

  services[serviceName] =
    (services[serviceName] || []).filter(
      s => !(s.host === host && s.port === Number(port))
    )

  res.json({ status: "deregistered" })
})

// DISCOVER SERVICES
app.get("/registry/services/:serviceName", (req, res) => {

  const healthy = (services[req.params.serviceName] || []).filter(
    s => Date.now() - s.lastHeartbeat < HEARTBEAT_TIMEOUT
  );

  res.json(healthy);
});


// CLEANUP DEAD INSTANCES
setInterval(() => {

  for (let service in services) {

    services[service] = services[service].filter(
      s => Date.now() - s.lastHeartbeat < HEARTBEAT_TIMEOUT
    );

  }

}, 5000);


app.listen(8500, () => {
  console.log("Service Registry running on port 8500");
});