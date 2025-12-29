const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Playlist = sequelize.define(
  "Playlist",
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
    visibility: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // true = public, false = private
    },
    nb_tracks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    fans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: "playlists",
  }
);

Playlist.prototype.toDTO = function () {
  return {
    id: this.id,
    title: this.title,
    cover: this.cover,
    label: this.label,
    userId: this.userId,
    visibility: this.visibility,
    nb_tracks: this.nb_tracks,
    fans: this.fans,
    trackIds: (this.tracks || []).map((track) => track.id),
  };
};

Playlist.prototype.toFull = function () {
  return {
    id: this.id,
    title: this.title,
    cover: this.cover,
    label: this.label,
    userId: this.userId,
    visibility: this.visibility,
    nb_tracks: this.nb_tracks,
    fans: this.fans,
    tracks: (this.tracks || []).map((track) => track.toDTO()),
  };
};

module.exports = Playlist;
