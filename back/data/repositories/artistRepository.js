const { Artist } = require("../../models");
const { Op } = require("sequelize");

async function findArtistsSortedByFans(limit) {
  return Artist.findAll({ order: [["fans", "DESC"]], limit: limit });
}

async function findSearchedArtistsSorted(query, limit = 20) {
  return Artist.findAll({
    where: {
      name: {
        [Op.like]: `%${query}%`,
      },
    },
    order: [["fans", "DESC"]],
    limit: limit,
  });
}
// async function saveArtist(artist) {
//   const artistsFromFile = await getArtistsFromFile();

//   if (artistsFromFile.some((ar) => ar.id === artist.id)) {
//     const err = new Error(`Artists with id ${artist.id} already exists`);
//     err.status = 400;
//     throw err;
//   }

//   artistsFromFile.push(artist);

//   await fs.writeFile(
//     PLAYLIST_FILE_PATH,
//     JSON.stringify(artistsFromFile, null, 2)
//   );
// }

async function findArtistById(id) {
  return Artist.findByPk(id);
}

module.exports = {
  // saveArtist,
  findArtistsSortedByFans,
  findSearchedArtistsSorted,
  findArtistById,
};
