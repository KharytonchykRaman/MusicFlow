const albumService = require("../entities/albumService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");

const getHomePageData = async () => {
  const result = {
    artists: [],
    albums: [],
    playlists: [],
  };

  const popularArtists = await artistService.getPopularArtists(10);

  result.artists = popularArtists;

  const popularAlbums = await albumService.getPopularAlbums(10);

  result.albums = popularAlbums;

  const popularPlaylists = await playlistService.getPopularPlaylists(10);

  result.playlists = popularPlaylists;

  return result;
};

module.exports = { getHomePageData };
