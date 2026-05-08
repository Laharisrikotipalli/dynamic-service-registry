const express = require("express");
const axios = require("axios");
const os = require("os");

const app = express();

const SERVICE_NAME = "product-service";
const HOST = os.hostname();
const PORT = process.env.PORT || 3001;
const REGISTRY_URL = process.env.REGISTRY_URL || "http://service-registry:8500";

async function register() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/register`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Product service registered:", HOST);

    startHeartbeat();

  } catch (error) {
    console.log("Registry registration failed, retrying...");
    setTimeout(register, 5000);
  }
}

function startHeartbeat() {
  setInterval(async () => {
    try {
      await axios.post(`${REGISTRY_URL}/registry/heartbeat`, {
        serviceName: SERVICE_NAME,
        host: HOST,
        port: PORT
      });

      console.log("Heartbeat sent:", HOST);

    } catch (error) {
      console.log("Heartbeat failed");
    }
  }, 10000);
}

async function deregister() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/deregister`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Product service deregistered:", HOST);
  } catch (error) {
    console.log("Deregistration failed");
  }
}

process.on("SIGTERM", async () => {
  console.log("Stopping product service...");
  await deregister();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Interrupt received...");
  await deregister();
  process.exit(0);
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
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
