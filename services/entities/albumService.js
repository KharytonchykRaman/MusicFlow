const repository = require("../../data/repositories/albumRepository");

async function getPopularAlbums(limit = 10) {
  const rawAlbums = await repository.findAlbumsSortedByFans(limit);
  return rawAlbums;
}

function sortByFans(albums) {
  const result = structuredClone(albums);

  result.sort((al1, al2) => al2.fans - al1.fans);

  return result;
}

async function getSearchedAlbums(q, limit) {
  const rawSearchedAlbums = await repository.findSearchedAlbums(q, limit);

  const sorted = sortByFans(rawSearchedAlbums);

  return sorted;
}

module.exports = {
  getSearchedAlbums,
  getPopularAlbums,
  sortByFans,
};
