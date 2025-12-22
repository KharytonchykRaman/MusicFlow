const repository = require("../../data/repositories/playlistRepository");

function toPlaylistDTOCompact(raw) {
  return {
    id: raw.id,
    title: raw.title,
    cover: raw.cover,
    label: raw.label,
    userId: raw.userId,
    visibility: raw.visibility,
    nb_tracks: raw.nb_tracks,
    fans: raw.fans,
    type: raw.type,
  };
  #id;
  #title;
  #rank;
  #preview;
  #type;
  #contributors;
  #artist;
  #album;
}

async function getPopularPlaylists(limit = 10) {
  const rawPlaylists = await repository.findPublicPlaylistsSortedByFans(limit);
  return rawPlaylists.map((p) => toPlaylistDTOCompact(p));
}

function sortByFans(playlists) {
  const result = structuredClone(playlists);

  result.sort((pl1, pl2) => pl2.fans - pl1.fans);

  return result;
}

async function getSearchedPlaylists(q, limit) {
  const rawSearchedPlaylists = await repository.findSearchedPlaylists(q, limit);

  const playlistsDTO = rawSearchedPlaylists.map((p) => toPlaylistDTOCompact(p));

  const sorted = sortByFans(playlistsDTO);

  return sorted;
}

module.exports = {
  getPopularPlaylists,
  sortByFans,
  getSearchedPlaylists,
};
