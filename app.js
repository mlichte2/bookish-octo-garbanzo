// Add variables from dotenv into process.env vars
require("dotenv").config();

// set up express server
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// adding fetch api

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

//allows JSON payloads to be sent to server
const bp = require("body-parser");
app.use(bp.json());

// hosting the public folder

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const PRIMER_API_URL = "https://api.sandbox.primer.io";

const API_KEY = process.env.API_KEY;

app.post("/client-session", async (req, res) => {
  const url = `${PRIMER_API_URL}/client-session`;
  const requestBody = req.body;
  console.log(requestBody);
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Version": "2021-10-19",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify(requestBody),
  })
    .then((data) => data.json())
    .catch((err) => console.log(err));
  console.log(response);
  return res.send(response);
});
