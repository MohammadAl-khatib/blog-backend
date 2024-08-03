const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.json("server started successfully");
});

app.listen(4000, "localhost", () => {
  console.log("server started successfully");
});
