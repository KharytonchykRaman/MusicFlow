const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getTracks } = require("../../data/repositories/trackRepository");

const searchTracks = createAsyncSearch(getTracks, ["title"]);

module.exports = { searchTracks };
