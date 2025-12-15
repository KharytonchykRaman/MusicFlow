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

const searchArtists = createAsyncSearch(getArtists, ["name"]);

module.exports = { getArtistsCompact, searchArtists };
