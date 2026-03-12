const express = require("express");
const axios = require("axios");

const app = express();

const SERVICE_NAME = "pricing-service";
const HOST = process.env.HOST || "pricing-service";
const PORT = process.env.PORT || 3002;
const REGISTRY_URL = process.env.REGISTRY_URL || "http://service-registry:8500";

// REGISTER SERVICE
async function register() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/register`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Pricing service registered");
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

    console.log("Pricing service deregistered");
  } catch (err) {}
}

// SEND HEARTBEAT EVERY 10s
setInterval(heartbeat, 10000);

// GRACEFUL SHUTDOWN
process.on("SIGTERM", async () => {
  console.log("Stopping pricing service...");
  await deregister();
  process.exit();
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// PRICING API
app.get("/pricing", (req, res) => {
  res.json([
    { productId: 1, price: 1200 },
    { productId: 2, price: 800 },
    { productId: 3, price: 450 }
  ]);
});

app.listen(PORT, async () => {
  console.log(`Pricing service running on port ${PORT}`);
  await register();
});