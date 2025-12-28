// models/Track.js
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
    // contributors пока не моделируем как отдельную сущность → храним как JSON
    contributors: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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

Track.prototype.toDTO = async function () {
  const album = await this.getAlbum();
  const artists = await this.getArtists();
  const genres = []; // если нужно — можно добавить связь Track-Genre позже

  return {
    id: this.id,
    title: this.title,
    rank: this.rank,
    preview: this.preview,
    track_position: this.track_position,
    contributors: this.contributors,
    albumId: album ? album.id : null,
    cover: this.cover || (album ? album.cover : null),
    artists: artists.map(a => a.toDTO()),
    // genres: genres.map(g => g.toDTO()),
  };
};

module.exports = Track;