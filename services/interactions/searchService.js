const trackService = require("../entities/trackService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");
const albumService = require("../entities/albumService");
const Artist = require("../../models/Artist");

const search = async (q, trackLimit = 20, playlistLimit = 10) => {
  const tracks = await trackService.searchTracks(q, trackLimit);

  let artists = await artistService.searchArtists(q, playlistLimit);
  artists = artistService.getArtistsCompact(artists);

  // let playlists = playlistService.search(q, playlistLimit);

  let albums = await albumService.searchAlbums(q, playlistLimit);
  albums = albumService.getAlbumsCompact(albums);

  const result = {
    tracks,
    artists,
    albums,
    //playlists,
  };

  return result;
};

module.exports = { search };
