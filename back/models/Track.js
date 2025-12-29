const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Track = sequelize.define(
  "Track",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    preview: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    track_position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    cover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "tracks",
  }
);

Track.prototype.toFull = function () {
  if (!this.artists) {
    const newError = new Error(
      "Track.toFull(): artists not loaded. Use include: [{ model: Artist, as: 'artists' }] in query."
    );
    newError.status = 500;
    throw newError;
  }

  return {
    id: this.id,
    title: this.title,
    rank: this.rank,
    preview: this.preview,
    track_position: this.track_position,
    cover: this.cover,
    albumId: this.albumId,
    artists: this.artists.map((a) => a.toFull()),
  };
};

module.exports = Track;
