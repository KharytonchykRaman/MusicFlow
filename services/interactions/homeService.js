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
  const popularArtistsCompacted =
    artistService.getArtistsCompact(popularArtists);

  result.artists = popularArtistsCompacted;

  const popularAlbums = await albumService.getPopularAlbums(10);
  const popularAlbumsCompacted = albumService.getAlbumsCompact(popularAlbums);

  result.albums = popularAlbumsCompacted;

  const popularPlaylists = await playlistService.getPopularPlaylists(10);

  result.playlists = popularPlaylists;

  return result;
};

module.exports = { getHomePageData };
