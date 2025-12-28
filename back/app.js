require("dotenv").config();

const { HTML_PAGE_PATH, PUBLIC_FOLDER_PATH } = require("./data/FileManager");

const express = require("express");
const app = express();

const { syncDatabase } = require("./models");
const { PORT } = process.env;

app.use(require("./routers/middlewareRouter"));
//app.use('/api/admin/', require("./routers/adminRouter"));
//app.use('/api/user/', require("./routers/userRouter"));
app.use("/api/", require("./routers/guestRouter"));

app.use("/public/", express.static(PUBLIC_FOLDER_PATH));
app.get("/", (req, res) => {
  res.sendFile(HTML_PAGE_PATH);
});

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Page not found: ${req.url}`,
  });
});

app.listen(PORT, async () => {
  console.log("Server is running on port 3000");
  try {
    await syncDatabase();
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error("COULD NOT CONNECT TO DATABASE:", error.message);
  }
});