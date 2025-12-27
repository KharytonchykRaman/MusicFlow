const repository = require("../../data/repositories/artistRepository");

async function getPopularArtists(limit = 10) {
  const rawArtists = await repository.findArtistsSortedByFans(limit);
  return rawArtists;
}

function sortByFans(artists) {
  const result = structuredClone(artists);

  result.sort((ar1, ar2) => ar2.fans - ar1.fans);

  return result;
}

async function getSearchedArtists(q, limit) {
  const rawSearchedArtists = await repository.findSearchedArtists(q, limit);

  const sorted = sortByFans(rawSearchedArtists);

  return sorted;
}

async function getArtistById(id) {
  const numId = Number(id);
  const rawArtist = await repository.findArtistById(numId);
  if (!rawArtist) {
    const newError = new Error(`Artist with id ${id} not found`);
    throw newError;
  }
  return rawArtist;
}

module.exports = {
  getSearchedArtists,
  getPopularArtists,
  sortByFans,
  getArtistById,
};
