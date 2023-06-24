const express = require("express");
const bodyparser = require("body-parser");
let cors = require("cors");
const routes = require("./routes/myRoutes");

const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionSuccessStatus: 200,
};

const app = express();
PORT = 8000;
app.use(cors(corsOptions));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(bodyparser.text({ type: "text/html" }));

app.use("/api/", routes);

app.listen(PORT, (error) => {
  if (!error) console.log("Server is Running");
  else console.log("Error occurred, server can't start", error);
});
