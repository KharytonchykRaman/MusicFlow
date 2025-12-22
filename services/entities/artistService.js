const repository = require("../../data/repositories/artistRepository");

function toArtistDTOCompact(raw) {
  return {
    id: raw.id,
    name: raw.name,
    picture: raw.picture,
    fans: raw.fans,
    type: raw.type,
  };
}

async function getPopularArtists(limit = 10) {
  const rawArtists = await repository.findArtistsSortedByFans(limit);
  return rawArtists.map((ar) => toArtistDTOCompact(ar));
}

function sortByFans(artists) {
  const result = structuredClone(artists);

  result.sort((ar1, ar2) => ar2.fans - ar1.fans);

  return result;
}

async function getSearchedArtists(q, limit) {
  const rawSearchedArtists = await repository.findSearchedArtists(q, limit);

  const artistsDTO = rawSearchedArtists.map((ar) => toArtistDTOCompact(ar));

  const sorted = sortByFans(artistsDTO);

  return sorted;
}

module.exports = {
  getSearchedArtists,
  getPopularArtists,
  sortByFans,
};
