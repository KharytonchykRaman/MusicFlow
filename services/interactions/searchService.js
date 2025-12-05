const trackService = require("../entities/trackService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");
const albumService = require("../entities/albumService");

const search = (q, trackLimit = 20, playlistLimit = 10) => {
  const tracks = trackService.search(q, trackLimit);
  const artists = artistService.search(q, playlistLimit);
  const playlists = playlistService.search(q, playlistLimit);
  const albums = albumService.search(q, playlistLimit);

  const result = {
    tracks,
    artists,
    albums,
    playlists,
  };

  return result;
};

module.exports = { search };
