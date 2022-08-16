const express = require("express");
const app = express();
const port = 6789;

app.use(function (req, res, next) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

app.get("/local/nodes", (req, res) => {
  res.json({
    data: [0, 1, 2],
  });
});

app.get("/local/file", (req, res) => {
  res.json({
    data: {
      name: "file1",
      root: "0x3912275cf09f8982a69735a876c14584dae95078762090c5d32fdf0dbec0647c",
      size: "1238",
      segments: 156,
    },
  });
});

let statusCounter = 0;

function nextStatus() {
  if (statusCounter === 0) {
    statusCounter = 1;
    return "unavailable";
  } else if (statusCounter === 1) {
    statusCounter = 2;
    return "available";
  } else if (statusCounter === 2) {
    statusCounter = 0;
    return "finalized";
  }
}

app.get("/local/status", (req, res) => {
  res.json({ data: nextStatus() });
});

app.post("/local/upload", (req, res) => {
  res.send("ok");
});
app.get("/local/download", (req, res) => {
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
