const repository = require("../../data/repositories/trackRepository");

async function getPopularTracks(limit = 10) {
  const rawTracks = await repository.findTracksSortedByRank(limit);
  return rawTracks;
}

function sortByRank(tracks) {
  const result = structuredClone(tracks);

  result.sort((tr1, tr2) => tr2.rank - tr1.rank);

  return result;
}

async function getSearchedTracks(q, limit) {
  const rawSearchedTracks = await repository.findSearchedTracks(q, limit);

  const sorted = sortByRank(rawSearchedTracks);

  return sorted;
}

async function getTracksByAlbumId(albumId) {
  const numId = Number(albumId)
  const result = await repository.findTracksByAlbumId(numId);

  return result;
}

module.exports = {
  getPopularTracks,
  sortByRank,
  getSearchedTracks,
  getTracksByAlbumId
};
