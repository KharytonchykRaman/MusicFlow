const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getArtists } = require("../../data/repositories/artistRepository");

function getArtistsCompact(artists) {
  return artists.map(({ albumlist, ...rest }) => rest);
}

async function getPopularArtists(limit = 20) {
  const artists = await getArtists();
  const sorted = artists.sort((a, b) => b.fans - a.fans);
  return sorted.slice(0, limit);
}

function sortByFans(artists) {
  const result = structuredClone(artists);

  result.sort((ar1, ar2) => ar2.fans - ar1.fans);

  return result;
}

const searchArtists = createAsyncSearch(getArtists, ["name"]);

module.exports = {
  getArtistsCompact,
  searchArtists,
  getPopularArtists,
  sortByFans,
};
