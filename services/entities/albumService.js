const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getAlbums } = require("../../data/repositories/albumRepository");

function getAlbumsCompact(albums) {
  return albums.map(({ tracklist, ...rest }) => ({ rest }));
}

const searchAlbums = createAsyncSearch(getAlbums, ["title", "label"]);

module.exports = { getAlbumsCompact, searchAlbums };
