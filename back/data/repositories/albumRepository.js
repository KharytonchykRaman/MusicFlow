const { Album, Track, Artist, Genre } = require("../../models");
const { Op } = require("sequelize");

async function findAlbumsSortedByFans(limit) {
  return Album.findAll({
    include: [
      {
        model: Artist,
        as: "artists",
      },
    ],
    order: [["fans", "DESC"]],
    limit: limit,
  });
}

async function findSearchedAlbumsSorted(query, limit = 20) {
  return Album.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { label: { [Op.like]: `%${query}%` } },
      ],
    },
    include: [{ model: Artist, as: "artists" }],
    order: [["fans", "DESC"]],
    limit: limit,
  });
}

// async function saveAlbum(album) {
//   const albumsData = await getAlbumsFromFile();

//   if (albumsData.some((al) => al.id === album.id)) {
//     const err = new Error(`Album with id ${album.id} already exists`);
//     err.status = 400;
//     throw err;
//   }

//   albumsData.push(album);

//   await fs.writeFile(ALBUM_FILE_PATH, JSON.stringify(albumsData, null, 2));
// }

async function findFullAlbumById(id) {
  return Album.findByPk(id, {
    include: [
      {
        model: Artist,
        as: "artists",
      },
      {
        model: Track,
        as: "tracks",
        include: [
          { model: Genre, as: "genres" },
          { model: Artist, as: "artists" },
        ],
        order: [["track_position", "ASC"]],
      },
    ],
  });
}

async function findCompactAlbumById(id) {
  return Album.findByPk(id, {
    include: [{ model: Artist, as: "artists" }],
  });
}

async function findAlbumsByArtistId(artistId) {
  return Album.findAll({
    include: [
      {
        model: Artist,
        as: "artists",
        where: { id: artistId },
      },
    ],
    order: [["release_date", "DESC"]],
  });
}

module.exports = {
  findSearchedAlbumsSorted,
  findAlbumsSortedByFans,
  //saveAlbum,
  findFullAlbumById,
  findAlbumsByArtistId,
  findCompactAlbumById,
};
