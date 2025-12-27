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
  const numId = Number(albumId);
  const result = await repository.findTracksByAlbumId(numId);

  return result;
}

async function getTracksByArtistId(artistId) {
  const numId = Number(artistId);
  const result = await repository.findTracksByArtistId(numId);

  return result;
}

async function getTracksByGenreId(genreId) {
  const numId = Number(genreId);
  const result = await repository.findTracksByGenreId(numId);

  return result;
}

module.exports = {
  getPopularTracks,
  sortByRank,
  getSearchedTracks,
  getTracksByAlbumId,
  getTracksByArtistId,
  getTracksByGenreId,
};
