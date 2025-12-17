const trackService = require("../entities/trackService");
const artistService = require("../entities/artistService");
const playlistService = require("../entities/playlistService");
const albumService = require("../entities/albumService");

const search = async (q, trackLimit = 20, playlistLimit = 10) => {
  const tracks = await trackService.searchTracks(q, trackLimit);
  const sortedTracks = trackService.sortByRank(tracks);

  let artists = await artistService.searchArtists(q, playlistLimit);
  artists = artistService.getArtistsCompact(artists);
  const sortedArtists = artistService.sortByFans(artists);

  let playlists = await playlistService.searchPlaylists(q, playlistLimit);
  playlists = playlistService.getPlaylistsCompact(playlists);
  const sortedPlaylists = playlistService.sortByFans(playlists);

  let albums = await albumService.searchAlbums(q, playlistLimit);
  albums = albumService.getAlbumsCompact(albums);
  const sortedAlbums = albumService.sortByFans(albums);

  const result = {
    tracks: sortedTracks,
    artists: sortedArtists,
    albums: sortedAlbums,
    playlists: sortedPlaylists,
  };

  return result;
};

module.exports = { search };
