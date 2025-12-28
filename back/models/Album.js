// models/Album.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Album = sequelize.define(
  "Album",
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
    cover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    release_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    record_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "album",
    },
    nb_tracks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    timestamps: true,
    tableName: "albums",
  }
);

Album.prototype.toDTO = async function () {
  const artists = await this.getArtists();
  const genres = await this.getGenres();

  return {
    id: this.id,
    title: this.title,
    cover: this.cover?.trim() || null,
    label: this.label,
    fans: this.fans,
    release_date: this.release_date,
    record_type: this.record_type,
    nb_tracks: this.nb_tracks,
    artists: artists.map(a => a.toDTO()),
    genres: genres.map(g => g.toDTO()),
  };
};

module.exports = Album;