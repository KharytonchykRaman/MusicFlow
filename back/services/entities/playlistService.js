const repository = require("../../data/repositories/playlistRepository");
const trackService = require("./trackService");

async function getPopularPlaylists(limit = 10) {
  const rawPlaylists = await repository.findPublicPlaylistsSortedByFans(limit);
  return rawPlaylists;
}

function sortByFans(playlists) {
  const result = structuredClone(playlists);

  result.sort((pl1, pl2) => pl2.fans - pl1.fans);

  return result;
}

async function getSearchedPlaylists(q, limit) {
  const rawSearchedPlaylists = await repository.findSearchedPlaylists(q, limit);

  const sorted = sortByFans(rawSearchedPlaylists);

  return sorted;
}

async function getPlaylistById(id) {
  const numId = Number(id);
  const rawPlaylist = await repository.findPlaylistById(numId);
  if (!rawPlaylist) {
    const newError = new Error(`Playlist with id ${id} not found`);
    throw newError;
  }
  return rawPlaylist;
}

async function fillPlaylist(playlist) {
  const result = structuredClone(playlist);

  const trackIds = [...result.tracklist];

  const tracks = await Promise.all(
    trackIds.map((trId) => trackService.getTrackById(trId))
  );

  result.tracklist = tracks;
  return result;
}

module.exports = {
  getPopularPlaylists,
  sortByFans,
  getSearchedPlaylists,
  getPlaylistById,
  fillPlaylist,
};
