const express = require("express");
const axios = require("axios");
const os = require("os");

const app = express();

const SERVICE_NAME = "pricing-service";
const HOST = os.hostname(); 
const PORT = process.env.PORT || 3002;
const REGISTRY_URL = process.env.REGISTRY_URL || "http://service-registry:8500";

async function register() {
  try {
    await axios.post(`${REGISTRY_URL}/registry/register`, {
      serviceName: SERVICE_NAME,
      host: HOST,
      port: PORT
    });

    console.log("Pricing service registered:", HOST);


    startHeartbeat();

  } catch (error) {
    console.log("Registry registration failed, retrying...");
    setTimeout(register, 5000); // retry after 5 sec
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

    console.log("Pricing service deregistered:", HOST);
  } catch (error) {
    console.log("Deregistration failed");
  }
}


process.on("SIGTERM", async () => {
  console.log("Stopping pricing service...");
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