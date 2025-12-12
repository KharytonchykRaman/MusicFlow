const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getPlaylists } = require("../../data/repositories/playlistRepository");

function getPlaylistsCompact(playlists) {
  return playlists.map(({ tracklist, ...rest }) => ({ rest }));
}

const searchPlaylists = createAsyncSearch(getPlaylists, ["title", "label"]);

module.exports = { getPlaylistsCompact, searchPlaylists };
