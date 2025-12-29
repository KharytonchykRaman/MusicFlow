const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Genre = sequelize.define(
  "Genre",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
  },
  {
    timestamps: false,
    tableName: "genres",
  }
);

Genre.prototype.toDTO = function () {
  return {
    id: this.id,
    name: this.name,
  };
};

module.exports = Genre;