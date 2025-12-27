const express = require("express");
const { HTML_PAGE_PATH, PUBLIC_FOLDER_PATH } = require("./data/FileManager");
require("dotenv").config();

const app = express();

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

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3000/');
});
