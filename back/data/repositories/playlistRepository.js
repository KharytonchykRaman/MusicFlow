const { Playlist } = require("../../models");
const { Op } = require("sequelize");

async function findSearchedPlaylistsSorted(query, limit = 20) {
  return Playlist.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { label: { [Op.like]: `%${query}%` } },
      ],
    },
    order: [["fans", "DESC"]],
    limit: limit,
  });
}

async function findPublicPlaylistsSortedByFans(limit) {
  return Playlist.findAll({
    where: { visibility: true },
    order: [["fans", "DESC"]],
    limit: limit,
  });
}

// async function savePlaylist(playlist) {
//   const playlistsFromFile = await getPlaylistsFromFile();

//   if (playlistsFromFile.some((p) => p.id === playlist.id)) {
//     const err = new Error(`Playlist with id ${playlist.id} already exists`);
//     err.status = 400;
//     throw err;
//   }

//   playlistsFromFile.push(playlist);

//   await fs.writeFile(
//     PLAYLIST_FILE_PATH,
//     JSON.stringify(playlistsFromFile, null, 2)
//   );
// }

async function findFullPlaylistById(id) {
  return Playlist.findByPk(id, {
    include: [{ model: Track, as: "tracks" }],
  });
}

module.exports = {
  //savePlaylist,
  findPublicPlaylistsSortedByFans,
  findSearchedPlaylistsSorted,
  findFullPlaylistById,
};
