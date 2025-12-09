const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createSearch } = require("../../utils");
const { genresData } = require("../../data/repositories/genreRepository");

const getPopularTracks = (genreId, limit = 20) => {};

const search = createSearch(genresData, ["name"]);

module.exports = { getPopularTracks, search };
