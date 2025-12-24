const repository = require("../../data/repositories/playlistRepository");

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

module.exports = {
  getPopularPlaylists,
  sortByFans,
  getSearchedPlaylists,
};
