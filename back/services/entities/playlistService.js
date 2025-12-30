const repository = require("../../data/repositories/playlistRepository");

async function getPopularPlaylists(limit = 10) {
  const playlists = await repository.findPublicPlaylistsSortedByFans(limit);
  const DTOs = playlists.map((pl) => pl.toCompact());
  return DTOs;
}

async function getSearchedPlaylists(q, limit) {
  const playlists = await repository.findSearchedPlaylistsSorted(q, limit);
  const DTOs = playlists.map((pl) => pl.toCompact());
  return DTOs;
}

async function getPlaylistById(id) {
  const playlist = await repository.findFullPlaylistById(id);
  if (!playlist) {
    const newError = new Error(`Playlist with id ${id} not found`);
    newError.status = 400;
    throw newError;
  }
  return playlist.toFull();
}

module.exports = {
  getPopularPlaylists,
  getSearchedPlaylists,
  getPlaylistById,
};
