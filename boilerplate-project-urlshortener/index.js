require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

try {
  mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
} catch (err) {
  console.log(err);
}

const schema = new mongoose.Schema({
  original: { type: String, required: true },
  short: { type: Number, required: true },
});
const Url = mongoose.model("Url", schema);

const port = process.env.PORT || 3000;

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", async (req, res) => {
  const bodyUrl = req.body.url;
  console.log("🚀 ~ app.post ~ bodyUrl:", bodyUrl);
  // let urlRegex = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/);
  let urlRegex = new RegExp(/^https?:\/\/(www\.)?localhost(:\d{1,5})?(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/);
  if (!bodyUrl.match(urlRegex)) {
    return res.json({ error: "Invalid URL" });
  }

  dns.lookup(new URL(bodyUrl).hostname, async (err) => {
    if (err) {
      return res.json({ error: "Invalid URL" });
    }

    try {
      let index = 1;
      const latestUrl = await Url.findOne({}).sort({ short: "desc" }).exec();
      if (latestUrl) {
        index = latestUrl.short + 1;
      }

      const newUrl = new Url({ original: bodyUrl, short: index });
      await newUrl.save();

      res.json({ original_url: bodyUrl, short_url: index });
    } catch (error) {
      console.error("Error saving URL:", error);
      res.json({ error: "Error saving URL" });
    }
  });
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shortUrl = req.params.short_url;

  try {
    const shortUrlNumber = parseInt(shortUrl);
    const url = await Url.findOne({ short: shortUrlNumber }).exec();

    if (!url) {
      return res.json({ error: "URL NOT FOUND" });
    }

    res.redirect(url.original);
  } catch (error) {
    console.error("Error retrieving URL:", error);
    res.json({ error: "Error retrieving URL" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
