"use strict";
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Market Snapshot API",
      version: "2.0.0",
      description:
        "Real-time stock quotes, watchlists, and global market status. Powered by Twelve Data.",
      contact: { email: "support@example.com" },
    },
    servers: [{ url: "https://market-snapshot-api.onrender.com" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);