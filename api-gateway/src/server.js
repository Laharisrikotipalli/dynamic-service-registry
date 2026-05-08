const express = require("express");
const axios = require("axios");

const app = express();
const REGISTRY_URL = process.env.REGISTRY_URL || "http://service-registry:8500";

let cache = {
  "product-service": [],
  "pricing-service": []
};

let indexMap = {
  "product-service": 0,
  "pricing-service": 0
};

async function refreshCache() {
  try {
    const productRes = await axios.get(`${REGISTRY_URL}/registry/services/product-service`);
    const pricingRes = await axios.get(`${REGISTRY_URL}/registry/services/pricing-service`);

    cache["product-service"] = productRes.data;
    cache["pricing-service"] = pricingRes.data;

    console.log("Cache updated");
  } catch (err) {
    console.log("Registry unavailable, using old cache");
  }
}

refreshCache();
setInterval(refreshCache, 5000);

function discover(serviceName) {
  const services = cache[serviceName];

  if (!services || services.length === 0) {
    throw new Error(`No instances found for ${serviceName}`);
  }

  const idx = indexMap[serviceName] % services.length;
  indexMap[serviceName]++;

  return services[idx];
}

async function proxyWithRetry(serviceName, path) {
  const instances = cache[serviceName];
  const total = instances ? instances.length : 0;

  if (total === 0) {
    throw new Error(`No instances found for ${serviceName}`);
  }

  for (let attempt = 0; attempt < total; attempt++) {
    const service = discover(serviceName);
    try {
      const response = await axios.get(
        `http://${service.host}:${service.port}${path}`
      );
      return response.data;
    } catch (err) {
      console.log(`Instance ${service.host}:${service.port} unreachable, evicting from cache`);

      cache[serviceName] = cache[serviceName].filter(
        s => !(s.host === service.host && s.port === service.port)
      );

      indexMap[serviceName] = 0;

      if (attempt === total - 1) {
        throw new Error(`All instances of ${serviceName} are unreachable`);
      }
    }
  }
}

app.get("/api/products", async (req, res) => {
  try {
    const data = await proxyWithRetry("product-service", "/products");
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "product-service unavailable",
      details: err.message
    });
  }
});

app.get("/api/pricing", async (req, res) => {
  try {
    const data = await proxyWithRetry("pricing-service", "/pricing");
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "pricing-service unavailable",
      details: err.message
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.listen(8080, () =>
  console.log("API Gateway running on port 8080")
);
