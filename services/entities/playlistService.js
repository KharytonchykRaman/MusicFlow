const Track = require("../../models/Track");
const Album = require("../../models/Album");
const Artist = require("../../models/Artist");
const Playlist = require("../../models/Playlist");
const Genre = require("../../models/Genre");
const { createAsyncSearch } = require("../../utils");
const { getPlaylists } = require("../../data/repositories/playlistRepository");

function getPlaylistsCompact(playlists) {
  return playlists.map(({ tracklist, ...rest }) => rest);
}

async function getPopularPlaylists(limit = 20) {
  const playlists = await getPlaylists();
  const sorted = playlists.sort((a, b) => b.fans - a.fans);
  return sorted.slice(0, limit);
}

function sortByFans(playlists) {
  const result = structuredClone(playlists);

  result.sort((pl1, pl2) => pl2.fans - pl1.fans);

  return result;
}

const searchPlaylists = createAsyncSearch(getPlaylists, ["title", "label"]);

module.exports = {
  getPlaylistsCompact,
  searchPlaylists,
  getPopularPlaylists,
  sortByFans,
};
