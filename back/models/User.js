const { DataTypes } = require("sequelize");
const sequelize = require("../database");

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
  },
  {
    timestamps: true,
    tableName: "users",
  }
);

User.prototype.toDTO = function () {
  const likedTracks = this.likedTracks || [];
  const likedAlbums = this.likedAlbums || [];
  const followedArtists = this.followedArtists || [];
  const likedPlaylists = this.likedPlaylists || [];
  const createdPlaylists = this.playlists || [];

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