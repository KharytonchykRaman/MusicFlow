const sequelize = require("../database");

const Artist = require("./Artist");
const Album = require("./Album");
const Track = require("./Track");
const Playlist = require("./Playlist");
const Genre = require("./Genre");
const User = require("./User");

Album.belongsToMany(Artist, {
  through: "AlbumArtist",
  as: "artists",
  timestamps: false,
  onDelete: "CASCADE",
});
Artist.belongsToMany(Album, {
  through: "AlbumArtist",
  as: "albums",
  timestamps: false,
  onDelete: "CASCADE",
});

Track.belongsToMany(Genre, {
  through: "TrackGenre",
  as: "genres",
  timestamps: false,
  onDelete: "CASCADE",
});
Genre.belongsToMany(Track, {
  through: "TrackGenre",
  as: "tracks",
  timestamps: false,
  onDelete: "RESTRICT",
});

Album.hasMany(Track, {
  foreignKey: "albumId",
  as: "tracks",
  onDelete: "CASCADE",
});
Track.belongsTo(Album, {
  foreignKey: "albumId",
  as: "album",
  onDelete: "SET NULL",
});

Track.belongsToMany(Artist, {
  through: "TrackArtist",
  as: "artists",
  timestamps: false,
  onDelete: "CASCADE",
});
Artist.belongsToMany(Track, {
  through: "TrackArtist",
  as: "tracks",
  timestamps: false,
  onDelete: "CASCADE",
});

User.hasMany(Playlist, {
  foreignKey: "userId",
  as: "playlists",
  onDelete: "CASCADE",
});
Playlist.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

Playlist.belongsToMany(Track, {
  through: "PlaylistTrack",
  as: "tracks",
  timestamps: false,
  onDelete: "CASCADE",
});
Track.belongsToMany(Playlist, {
  through: "PlaylistTrack",
  as: "playlists",
  timestamps: false,
  onDelete: "CASCADE",
});

User.belongsToMany(Track, {
  through: "UserLikedTrack",
  as: "likedTracks",
  timestamps: false,
  onDelete: "CASCADE",
});
Track.belongsToMany(User, {
  through: "UserLikedTrack",
  as: "likedByUsers",
  timestamps: false,
  onDelete: "CASCADE",
});

User.belongsToMany(Album, {
  through: "UserLikedAlbum",
  as: "likedAlbums",
  timestamps: false,
  onDelete: "CASCADE",
});
Album.belongsToMany(User, {
  through: "UserLikedAlbum",
  as: "likedByUsers",
  timestamps: false,
  onDelete: "CASCADE",
});

User.belongsToMany(Artist, {
  through: "UserFollowedArtist",
  as: "followedArtists",
  timestamps: false,
  onDelete: "CASCADE",
});
Artist.belongsToMany(User, {
  through: "UserFollowedArtist",
  as: "followers",
  timestamps: false,
  onDelete: "CASCADE",
});

User.belongsToMany(Playlist, {
  through: "UserLikedPlaylist",
  as: "likedPlaylists",
  timestamps: false,
  onDelete: "CASCADE",
});
Playlist.belongsToMany(User, {
  through: "UserLikedPlaylist",
  as: "likedByUsers",
  timestamps: false,
  onDelete: "CASCADE",
});

const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log("✅ Database synchronized");
  } catch (error) {
    console.error("❌ Database sync error:", error);
  }
};

module.exports = {
  Artist,
  Album,
  Track,
  Playlist,
  Genre,
  User,
  syncDatabase,
};
