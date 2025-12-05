const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../models/");
const { createSearch } = require("../../utils");
const { artistsData } = require("../../data/repositories/artistRepository");

const getPopularTracks = (artistId, limit = 20) => {};

const search = createSearch(artistsData, ["name"]);

module.exports = { getPopularTracks, search };
