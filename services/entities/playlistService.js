const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../models/");
const { createSearch } = require("../../utils");
const { playlistsData } = require("../../data/repositories/playlistRepository");

const getTracks = (playlistId) => {};

const search = createSearch(playlistsData, ["name"]);

module.exports = { getTracks, search };
