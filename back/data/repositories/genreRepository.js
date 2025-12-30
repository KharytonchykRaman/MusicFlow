const { Genre } = require("../../models");
const { Op } = require("sequelize");

async function findAll() {
  return Genre.findAll({ order: [["name", "ASC"]] });
}

async function findById(id) {
  return Genre.findByPk(id);
}

async function search(query, limit = 10) {
  return Genre.findAll({
    where: { name: { [Op.like]: `%${query}%` } },
    limit,
  });
}

module.exports = { findAll, findById, search };
