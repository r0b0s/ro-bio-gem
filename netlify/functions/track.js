const fetch = require("node-fetch"); // For local Node < 18
const crypto = require("crypto");

exports.handler = async (event) => {
  try {
    const SECRET_TOKEN = process.env.SECRET_TOKEN;
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!SECRET_TOKEN || !GOOGLE_SCRIPT_URL) {
      return {
        statusCode: 500,
        body: "Server configuration error: Missing environment variables."
      };
    }

    // Parse incoming data from frontend
    const body = JSON.parse(event.body);

    // Generate timestamp and hash
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = crypto
      .createHash("sha256")
      .update(SECRET_TOKEN + timestamp)
      .digest("base64");

    // Get origin from request headers
    const origin = event.headers.origin || event.headers.referer || "unknown";

    // Forward data to Google Apps Script
    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,       // all tracking fields from frontend
        origin: origin,
        timestamp: timestamp,
        hash: hash
      })
    });

    const text = await res.text();
    return {
      statusCode: res.status,
      body: text
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: "Error: " + err.message
    };
  }
};
