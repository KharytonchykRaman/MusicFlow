const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getTracks } = require("../../data/repositories/trackRepository");

const searchTracks = createAsyncSearch(getTracks, ["title"]);

function sortByRank(tracks) {
  const result = structuredClone(tracks);

  result.sort((tr1, tr2) => tr2.rank - tr1.rank);

  return result;
}

module.exports = { searchTracks, sortByRank };
