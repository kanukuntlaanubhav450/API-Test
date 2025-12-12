require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/**
 * POST /proxy
 * Expects: { url, method, headers, body }
 * Forwards the request using axios and returns status, headers, data
 */
app.post("/proxy", async (req, res) => {
  try {
    // IMPORTANT: destructure url, method, headers, body from the request body
    const { url, method = "GET", headers = {}, body = null } = req.body || {};

    if (!url) {
      return res.status(400).json({
        status: 400,
        statusText: "Bad Request",
        data: "No URL provided",
      });
    }

    const axiosConfig = {
      url,
      method: method.toUpperCase(),
      headers,
      timeout: 10000,
      validateStatus: () => true, // always resolve so we can forward non-2xx statuses
    };

    // Attach body for methods that support it
    if (["POST", "PUT", "PATCH", "DELETE"].includes(axiosConfig.method)) {
      axiosConfig.data = body;
    }

    const response = await axios(axiosConfig);

    res.json({
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      status: error.response?.status || 500,
      statusText: "Proxy Failed",
      data: error.response?.data || error.message,
    });
  }
});

/**
 * POST /save-request
 * Simple placeholder: logs payload and returns success.
 * Replace with Firestore logic later (server-side).
 */
app.post("/save-request", async (req, res) => {
  try {
    const data = req.body;
    console.log("Save-request payload:", JSON.stringify(data, null, 2));

    // TODO: Replace this placeholder with Firestore saving (server-side) when ready.
    return res.json({
      success: true,
      message: "Request received by backend (placeholder).",
    });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Save failed." });
  }
});

/**
 * DELETE /delete-saved-request
 * Placeholder endpoint for secure deletion (backend should perform Firestore delete).
 * Accepts JSON body: { userId, collectionName, itemId }
 */
app.delete("/delete-saved-request", async (req, res) => {
  try {
    const { userId, collectionName, itemId } = req.body || {};
    console.log("Delete request:", { userId, collectionName, itemId });

    // TODO: Implement server-side Firestore deletion here using admin credentials.
    return res.json({ success: true, message: "Delete request received (placeholder)." });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
