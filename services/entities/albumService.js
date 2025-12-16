const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getAlbums } = require("../../data/repositories/albumRepository");

function getAlbumsCompact(albums) {
  return albums.map(({ tracklist, ...rest }) => rest);
}

async function getPopularAlbums(limit = 20) {
  const albums = await getAlbums();
  const sorted = albums.sort((a, b) => b.fans - a.fans);
  return sorted.slice(0, limit);
}

function sortByFans(albums) {
  const result = structuredClone(albums);

  result.sort((al1, al2) => al2.fans - al1.fans);

  return result;
}

const searchAlbums = createAsyncSearch(getAlbums, ["title", "label"]);

module.exports = {
  getAlbumsCompact,
  searchAlbums,
  getPopularAlbums,
  sortByFans,
};
