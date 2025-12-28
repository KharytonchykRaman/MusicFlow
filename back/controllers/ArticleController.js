const { Article, User } = require("../models");

exports.createArticle = async (req, res) => {
  const { title, description, user } = req.body;
  try {
    const article = await Article.create({ title, description, userId: user });
    const articleWithUser = await Article.findByPk(article.id, {
      include: [{ model: User, as: "user" }],
    });
    res.status(201).json(articleWithUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [{ model: User, as: "user" }],
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArticleById = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [{ model: User, as: "user" }],
    });
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editArticleById = async (req, res) => {
  try {
    const [updated] = await Article.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ message: "Article not found" });
    const updatedArticle = await Article.findByPk(req.params.id, {
      include: [{ model: User, as: "user" }],
    });
    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteArticleById = async (req, res) => {
  try {
    const deleted = await Article.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) return res.status(404).json({ message: "Article not found" });
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
