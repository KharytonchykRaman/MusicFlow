// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const bcrypt = require("bcrypt"); // опционально, если добавите пароли позже

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    // Пароль можно добавить позже
    // password: { type: DataTypes.STRING, allowNull: true }
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

// Связи "избранное" реализуем через многие-ко-многим
// Но для простоты в toDTO() будем использовать отдельные таблицы

User.prototype.toDTO = async function () {
  const [
    likedTracks,
    likedAlbums,
    followedArtists,
    likedPlaylists,
    createdPlaylists,
  ] = await Promise.all([
    this.getLikedTracks(),
    this.getLikedAlbums(),
    this.getFollowedArtists(),
    this.getLikedPlaylists(),
    this.getPlaylists(), // created playlists
  ]);

  return {
    id: this.id,
    email: this.email,
    username: this.username,
    likedTrackIDs: likedTracks.map(t => t.id),
    likedAlbumIDs: likedAlbums.map(a => a.id),
    followedArtistIDs: followedArtists.map(a => a.id),
    likedPlaylistIDs: likedPlaylists.map(p => p.id),
    createdPlaylistIDs: createdPlaylists.map(p => p.id),
  };
};

module.exports = User;