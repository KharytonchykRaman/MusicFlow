const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  // Путь к файлу БД: в контейнере /app/data/database.sqlite
  // На хосте: ./back/data/database.sqlite (через volume)
  storage: process.env.DB_STORAGE || "./data/database.sqlite",
  logging: false,
});

module.exports = sequelize;
