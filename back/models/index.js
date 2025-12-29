const sequelize = require("../database");

const Artist = require("./Artist");
const Album = require("./Album");
const Track = require("./Track");
const Playlist = require("./Playlist");
const Genre = require("./Genre");
const User = require("./User");

// Альбом <-> Артист (многие-ко-многим)
Album.belongsToMany(Artist, {
  through: "AlbumArtist",
  timestamps: false,
  as: "artists",
});
Artist.belongsToMany(Album, {
  through: "AlbumArtist",
  timestamps: false,
  as: "albums",
});

// Альбом <-> Жанр (многие-ко-многим)
Album.belongsToMany(Genre, {
  through: "AlbumGenre",
  timestamps: false,
  as: "genres",
});
Genre.belongsToMany(Album, {
  through: "AlbumGenre",
  timestamps: false,
  as: "albums",
});

// Трек -> Альбом (один-ко-многим)
Album.hasMany(Track, { foreignKey: "albumId", as: "tracks" });
Track.belongsTo(Album, { foreignKey: "albumId", as: "album" });

// Трек <-> Артист (многие-ко-многим) — для исполнителей трека
Track.belongsToMany(Artist, {
  through: "TrackArtist",
  timestamps: false,
  as: "artists",
});
Artist.belongsToMany(Track, {
  through: "TrackArtist",
  timestamps: false,
  as: "tracks",
});

// Пользователь -> Плейлисты (созданные)
User.hasMany(Playlist, { foreignKey: "userId", as: "playlists" });
Playlist.belongsTo(User, { foreignKey: "userId", as: "user" });

// Плейлист <-> Трек (многие-ко-многим)
Playlist.belongsToMany(Track, {
  through: "PlaylistTrack",
  timestamps: false,
  as: "tracks",
});
Track.belongsToMany(Playlist, {
  through: "PlaylistTrack",
  timestamps: false,
  as: "playlists",
});

// Избранное: Пользователь <-> Треки
User.belongsToMany(Track, {
  through: "UserLikedTrack",
  timestamps: false,
  as: "likedTracks",
});
Track.belongsToMany(User, {
  through: "UserLikedTrack",
  timestamps: false,
  as: "likedByUsers",
});

// Избранное: Пользователь <-> Альбомы
User.belongsToMany(Album, {
  through: "UserLikedAlbum",
  timestamps: false,
  as: "likedAlbums",
});
Album.belongsToMany(User, {
  through: "UserLikedAlbum",
  timestamps: false,
  as: "likedByUsers",
});

// Избранное: Пользователь <-> Артисты
User.belongsToMany(Artist, {
  through: "UserFollowedArtist",
  timestamps: false,
  as: "followedArtists",
});
Artist.belongsToMany(User, {
  through: "UserFollowedArtist",
  timestamps: false,
  as: "followers",
});

// Избранное: Пользователь <-> Плейлисты
User.belongsToMany(Playlist, {
  through: "UserLikedPlaylist",
  timestamps: false,
  as: "likedPlaylists",
});
Playlist.belongsToMany(User, {
  through: "UserLikedPlaylist",
  timestamps: false,
  as: "likedByUsers",
});

// Синхронизация
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // ⚠️ только для разработки
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
