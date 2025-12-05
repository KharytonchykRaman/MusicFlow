const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../models/");
const { createSearch } = require("../../utils");
const { albumData } = require("../../data/repositories/artistRepository");

const getTracks = (albumId) => {};

const search = createSearch(albumData, ["name"]);

module.exports = { getTracks, search };
