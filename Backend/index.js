const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/proxy", async (req, res) => {
  const { url, method, headers, body } = req.body;

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });

  } catch (error) {
    res.json({
      status: error.response?.status || 500,
      statusText: "Request Failed",
      data: error.response?.data || error.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
