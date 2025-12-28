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

const sequelize = require('./database');

app.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('✅ Подключение к SQLite успешно!');
  } catch (error) {
    console.error('❌ Ошибка подключения:', error);
    res.status(500).send('Ошибка подключения к БД');
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server запущен на порту 3000');
});

/*
require("dotenv").config();
const { syncDatabase } = require("./models");

const { PORT } = process.env;

const path = require("path");
const express = require("express");

const userRouter = require("./routes/users");
const articleRouter = require("./routes/articles");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRouter);
app.use("/articles", articleRouter);

app.listen(PORT, async () => {
  console.log("Server is running on port 3000");
  try {
    await syncDatabase();
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error("COULD NOT CONNECT TO DATABASE:", error.message);
  }
});

*/