const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const albumService = require("../entities/albumService");
const genreService = require("../entities/genreService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");

const PLAYLIST_LENGTH = 20;

const getHomePageData = () => {
  const result = {
    artists: [],
    albums: [],
    playlists: [],
  };

  const popularArtists = await Artist.getPopularArtists(10);
  const popularArtistsCompacted = artistService.getArtistsCompact(popularArtists);

  result.artists = popularArtistsCompacted;   

  const popularAlbums = Album.getPopularAlbums();

  for (const album of popularAlbums) {
    result.albums[album.name] = albumService.getTracks(album.id);
  }

  const popularPlaylists = Playlist.getPopularPlaylists();

  for (const playlist of popularPlaylists) {
    result.playlists[playlist.name] = playlistService.getTracks(playlist.id);
  }

  return result;
};

module.exports = { getHomePageData };
