# **Dynamic Service Registry for a Cloud-Native Microservices Ecosystem**

## **Project Overview**

This project implements a **dynamic service discovery system** for a **cloud-native microservices architecture**.
The system contains **four main components**:

* **Service Registry**
* **API Gateway**
* **Product Service**
* **Pricing Service**

Each microservice automatically **registers itself**, sends **heartbeat signals**, and **deregisters on shutdown**.

The **API Gateway** acts as the **single entry point** and dynamically routes requests to **healthy services**.

---
## **Architecture Diagram**

The following diagram shows how the **Service Registry**, **API Gateway**, **Product Service**, and **Pricing Service** interact.

![Architecture Diagram](docs/architecture.png)

### **Flow Explanation**

1. Client sends requests to the **API Gateway**
2. The gateway queries the **Service Registry**
3. The registry returns healthy service instances
4. The gateway routes requests to **Product Service** or **Pricing Service**
5. Services send **heartbeat signals every 10 seconds**
6. If a service stops sending heartbeats for **30 seconds**, the registry removes it
---
## **Architecture Components**

### **Service Registry**

The **Service Registry** maintains the list of all running services.

Responsibilities:

* **Register new service instances**
* **Receive heartbeat signals**
* **Remove inactive services automatically**
* **Provide service discovery endpoints**

---

### **Product Service**

The **Product Service** provides product catalog data.

Features:

* Automatically **registers with the registry**
* Sends **heartbeat signals every 10 seconds**
* Provides **product API endpoints**

---

### **Pricing Service**

The **Pricing Service** provides pricing data for products.

Features:

* Automatically **registers with the registry**
* Sends **heartbeat signals**
* Provides **pricing API endpoints**

---

### **API Gateway**

The **API Gateway** acts as the **single entry point** for all external requests.

Responsibilities:

* Discover services dynamically
* Route traffic to healthy instances
* Perform **round-robin load balancing**

---

## **Project Structure**

```
dynamic-service-registry
│
├── service-registry
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       └── server.js
│
├── product-service
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       └── server.js
│
├── pricing-service
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       └── server.js
│
├── api-gateway
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       └── server.js
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## **Technologies Used**

* **Node.js**
* **Express.js**
* **Docker**
* **Docker Compose**
* **REST APIs**
* **Microservices Architecture**

---

## **Core Features**

### **Automatic Service Registration**

When a service starts, it automatically **registers itself** with the **Service Registry**.

---

### **Heartbeat Monitoring**

Each service sends a **heartbeat request every 10 seconds** to indicate it is still alive.

---

### **Automatic Service Cleanup**

If a service fails to send a heartbeat for **30 seconds**, it is automatically removed from the registry.

---

### **Graceful Deregistration**

When a service stops, it **deregisters itself** before exiting.

---

### **Dynamic Service Discovery**

The **API Gateway queries the Service Registry** to discover available services.

---

### **Load Balancing**

The gateway distributes requests across instances using **round-robin load balancing**.

---

### **Docker Containerization**

All services run in **Docker containers** and are orchestrated using **Docker Compose**.

---

## **Running the Application**

### **Step 1 — Build and Start Services**

Run the following command from the project root:

```
docker-compose up --build
```

This command starts:

* **Service Registry → Port 8500**
* **Product Service → Port 3001**
* **Pricing Service → Port 3002**
* **API Gateway → Port 8080**

---

## **API Endpoints**

### **Service Registry APIs**

#### **Register Service**

POST

```
http://localhost:8500/registry/register
```

Body:

```
{
 "serviceName": "test-service",
 "host": "10.0.0.5",
 "port": 3000
}
```

---

#### **Heartbeat**

POST

```
http://localhost:8500/registry/heartbeat
```

---

#### **Deregister Service**

POST

```
http://localhost:8500/registry/deregister
```

---

#### **Discover Services**

GET

```
http://localhost:8500/registry/services/product-service
```

---

### **Product Service APIs**

Health Check

```
http://localhost:3001/health
```

Products API

```
http://localhost:3001/products
```

---

### **Pricing Service APIs**

Health Check

```
http://localhost:3002/health
```

Pricing API

```
http://localhost:3002/pricing
```

---

### **API Gateway APIs**

Products via Gateway

```
http://localhost:8080/api/products
```

Pricing via Gateway

```
http://localhost:8080/api/pricing
```

---

## **Scaling Services**

The architecture supports **horizontal scaling**.

Example:

```
docker-compose up --scale product-service=3
```

This launches **three instances** of the product service.

The **API Gateway automatically balances requests** between instances.

---

## **Failover Testing**

To simulate service failure:

```
docker ps
```

Find a product service container ID.

Stop it:

```
docker stop <container_id>
```

After about **30 seconds**, the registry removes the failed instance and the gateway continues routing traffic to healthy instances.

---

## **Verification Steps**

### **Start the system**

```
docker-compose up
```

### **Verify containers**

```
docker-compose ps
```

### **Check service discovery**

```
http://localhost:8500/registry/services/product-service
```

### **Test API Gateway**

```
http://localhost:8080/api/products
```

```
http://localhost:8080/api/pricing
```

---

## **Environment Variables**

Example `.env.example`

```
REGISTRY_URL=http://service-registry:8500
PORT=3000
HOST=service-name
```

---

## **Key Concepts Demonstrated**

* **Microservices Architecture**
* **Service Discovery**
* **API Gateway Pattern**
* **Health Monitoring**
* **Distributed Systems Communication**
* **Docker Containerization**
* **Fault Tolerance**
* **Load Balancing**

---

## **Conclusion**

This project demonstrates how to build a **cloud-native microservices system with dynamic service discovery and health-based routing**.

The architecture automatically adapts to **service failures, scaling events, and dynamic cloud environments**, making it suitable for modern **distributed cloud platforms**.
