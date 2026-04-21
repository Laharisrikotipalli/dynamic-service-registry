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
setInterval(refreshCache, 30000);


function discover(serviceName) {
  const services = cache[serviceName];

  if (!services || services.length === 0) {
    throw new Error(`No instances found for ${serviceName}`);
  }

  const idx = indexMap[serviceName] % services.length;
  indexMap[serviceName]++;

  return services[idx];
}


app.get("/api/products", async (req, res) => {
  try {
    const service = discover("product-service");

    const response = await axios.get(
      `http://${service.host}:${service.port}/products`
    );

    res.json(response.data);

  } catch (err) {
    res.status(500).json({
      error: "product-service unavailable",
      details: err.message
    });
  }
});


app.get("/api/pricing", async (req, res) => {
  try {
    const service = discover("pricing-service");

    const response = await axios.get(
      `http://${service.host}:${service.port}/pricing`
    );

    res.json(response.data);

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