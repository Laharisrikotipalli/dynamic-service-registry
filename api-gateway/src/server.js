const express = require("express");
const axios = require("axios");

const app = express();
const REGISTRY_URL = "http://service-registry:8500";

let index = 0;

async function discover(serviceName) {
  const response = await axios.get(
    `${REGISTRY_URL}/registry/services/${serviceName}`
  );

  const services = response.data;

  if (!services.length)
    throw new Error(`No instances found for ${serviceName}`);

  const service = services[index % services.length];
  index++;

  return service;
}

app.get("/api/products", async (req, res) => {
  try {
    const service = await discover("product-service");

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
    const service = await discover("pricing-service");

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

app.listen(8080, () =>
  console.log("API Gateway running on port 8080")
);