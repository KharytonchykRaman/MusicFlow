const sequelize = require("../database");
const User = require("./User");
const Article = require("./Article");

// Определяем связи
Article.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Article, { foreignKey: "userId" });

const syncDatabase = async () => {
  try {
    // { force: true } — пересоздаёт таблицы каждый раз (только в dev!)
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Database sync error:", error);
  }
};

module.exports = { sequelize, User, Article, syncDatabase };
