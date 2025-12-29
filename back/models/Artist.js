const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Artist = sequelize.define(
  "Artist",
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
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    timestamps: true,
    tableName: "artists",
  }
);

Artist.prototype.toCompact = function () {
  return {
    id: this.id,
    name: this.name,
  };
};

Artist.prototype.toFull = function () {
  return {
    id: this.id,
    name: this.name,
    picture: this.picture,
    fans: this.fans,
  };
};

module.exports = Artist;
