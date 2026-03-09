const express = require("express");
const axios = require("axios");

const app = express();

const SERVICE_NAME = "product-service";
const HOST = process.env.HOST || "product-service";
const PORT = process.env.PORT || 3001;
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