const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createSearch } = require("../../utils");
const { artistsData } = require("../../data/repositories/artistRepository");

function getArtistsCompact(artists) {
    return artists.map(({ albumlist, ...rest }) => ({ rest }));
}

const search = createSearch(artistsData, ["name"]);

module.exports = { getArtistsCompact, search };
