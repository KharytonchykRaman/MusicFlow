const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { tracksData } = require("../../data/repositories/trackRepository");

const search = createAsyncSearch(tracksData, ["title"]);

module.exports = { search };
