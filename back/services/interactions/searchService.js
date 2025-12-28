const trackService = require("../entities/trackService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");
const albumService = require("../entities/albumService");

const search = async (q, trackLimit = 20, playlistLimit = 10) => {
  const tracks = await trackService.getSearchedTracks(q, trackLimit);

  const artists = await artistService.getSearchedArtists(q, playlistLimit);

  const playlists = await playlistService.getSearchedPlaylists(q, playlistLimit);

  const albums = await albumService.getSearchedAlbums(q, playlistLimit);

  const result = {
    tracks: tracks,
    artists: artists,
    albums: albums,
    playlists: playlists,
  };

  return result;
};

module.exports = { search };
