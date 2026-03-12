const express = require("express");
const axios = require("axios");

const app = express();

const SERVICE_NAME = "product-service";
const HOST = process.env.HOST || "product-service";
const PORT = process.env.PORT || 3001;
const REGISTRY_URL = process.env.REGISTRY_URL || "http://service-registry:8500";

// REGISTER SERVICE
async function register() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/register`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Product service registered");
  } catch (err) {
    console.log("Registry registration failed");
  }
}

// HEARTBEAT
async function heartbeat() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/heartbeat`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Heartbeat sent");
  } catch (err) {
    console.log("Heartbeat failed");
  }
}

// DEREGISTER
async function deregister() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/deregister`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Product service deregistered");
  } catch (err) {}
}

// SEND HEARTBEAT EVERY 10s
setInterval(heartbeat, 10000);

// GRACEFUL SHUTDOWN
process.on("SIGTERM", async () => {
  console.log("Stopping product service...");
  await deregister();
  process.exit();
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// PRODUCT API
app.get("/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop" },
    { id: 2, name: "Phone" },
    { id: 3, name: "Tablet" }
  ]);
});

app.listen(PORT, async () => {
  console.log(`Product service running on port ${PORT}`);
  await register();
});