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

Album.prototype.toCompact = function () {
  if (!this.artists) {
    const newError = new Error(
      "Album.toCompact(): artists not loaded. Use include: [{ model: Artist, as: 'artists' }] in query."
    );
    newError.status = 500;
    throw newError;
  }

  return {
    id: this.id,
    title: this.title,
    cover: this.cover || null,
    release_date: this.release_date,
    record_type: this.record_type,
    artists: this.artists.map((a) => a.toCompact()),
  };
};

Album.prototype.toFull = function () {
  if (!this.artists || this.tracks === undefined) {
    const newError = new Error(
      "Album.toFull(): artists or tracks not loaded. " +
        "Use include: [{ model: Artist, as: 'artists' }, { model: Track, as: 'tracks' }] in query."
    );
    newError.status = 500;
    throw newError;
  }

  return {
    id: this.id,
    title: this.title,
    cover: this.cover || null,
    label: this.label,
    fans: this.fans,
    release_date: this.release_date,
    record_type: this.record_type,
    nb_tracks: this.nb_tracks,
    artists: this.artists.map((a) => a.toFull()),
    tracks: (this.tracks || [])
      .sort((a, b) => a.track_position - b.track_position)
      .map((t) => t.toFull()),
  };
};

module.exports = Album;
