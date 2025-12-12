const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const albumService = require("../entities/albumService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");

const getHomePageData = async () => {
  const result = {
    artists: [],
    albums: [],
    playlists: [],
  };

  const popularArtists = await Artist.getPopularArtists(10);
  const popularArtistsCompacted =
    artistService.getArtistsCompact(popularArtists);

  result.artists = popularArtistsCompacted;

  const popularAlbums = await Album.getPopularAlbums(10);
  const popularAlbumsCompacted = albumService.getAlbumsCompact(popularAlbums);

  result.albums = popularAlbumsCompacted;

  const popularPlaylists = Playlist.getPopularPlaylists(10);
  const popularPlaylistsCompacted =
    playlistService.getPlaylistsCompact(popularPlaylists);

  result.playlists = popularPlaylistsCompacted;

  return result;
};

module.exports = { getHomePageData };
