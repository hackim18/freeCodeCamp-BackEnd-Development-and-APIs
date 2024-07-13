const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.get("/api", (req, res) => {
  const now = new Date();
  res.json({ unix: now.getTime(), utc: now.toUTCString() });
});

app.get("/api/:date", (req, res) => {
  const paramsDate = req.params.date;
  const invalidDate = "Invalid Date";
  const date = parseInt(paramsDate) < 10000 ? new Date(paramsDate) : new Date(parseInt(paramsDate));

  date.toString() === invalidDate ? res.json({ error: invalidDate }) : res.json({ unix: date.valueOf(), utc: date.toUTCString() });
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
