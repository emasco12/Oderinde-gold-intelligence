const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve your website
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Oderinde Gold Intelligence running on port ${PORT}`);
});
