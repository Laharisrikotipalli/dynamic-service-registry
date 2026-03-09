const express = require("express");
const axios = require("axios");

const app = express();

const SERVICE_NAME = "pricing-service";
const HOST = process.env.HOST || "pricing-service";
const PORT = process.env.PORT || 3002;
const REGISTRY_URL = process.env.REGISTRY_URL || "http://service-registry:8500";

async function register() {
  await axios.post(`${REGISTRY_URL}/registry/register`, {
    serviceName: SERVICE_NAME,
    host: HOST,
    port: PORT
  });
}

async function heartbeat() {
  await axios.post(`${REGISTRY_URL}/registry/heartbeat`, {
    serviceName: SERVICE_NAME,
    host: HOST,
    port: PORT
  });
}

async function deregister() {
  await axios.post(`${REGISTRY_URL}/registry/deregister`, {
    serviceName: SERVICE_NAME,
    host: HOST,
    port: PORT
  });
}

setInterval(heartbeat, 10000);

process.on("SIGTERM", async () => {
  await deregister();
  process.exit();
});

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

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