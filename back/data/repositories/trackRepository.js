const { Track, Genre, Artist } = require("../../models");
const { Op } = require("sequelize");

async function findSearchedTracksSorted(query, limit = 20) {
  return Track.findAll({
    where: {
      title: { [Op.like]: `%${query}%` },
    },
    include: [
      { model: Artist, as: "artists" },
      { model: Genre, as: "genres" },
    ],
    order: [["rank", "DESC"]],
    limit: limit,
  });
}

async function findTracksSortedByRank(limit) {
  return Track.findAll({ order: [["rank", "DESC"]], limit: limit });
}

// async function saveTrack(track) {
//   const tracksData = await getTracksFromFile();

//   if (tracksData.some((tr) => tr.id === track.id)) {
//     const err = new Error(`Track with id ${track.id} already exists`);
//     err.status = 400;
//     throw err;
//   }

//   tracksData.push(track);

//   await fs.writeFile(TRACK_FILE_PATH, JSON.stringify(tracksData, null, 2));
// }

async function findTracksByAlbumId(albumId) {
  return Track.findAll({
    where: { albumId: albumId },
    order: [["track_position", "ASC"]],
  });
}

async function findTracksByArtistId(artistId, limit) {
  const tracks = await Track.findAll({
    attributes: ["id"],
    include: [
      {
        model: Artist,
        as: "artists",
        where: { id: artistId },
        attributes: [],
      },
    ],
  });
  const trackIds = tracks.map((tr) => tr.id);

  if (trackIds.length === 0) {
    return [];
  }

  return Track.findAll({
    where: { id: { [Op.in]: trackIds } },
    include: [
      { model: Artist, as: "artists" },
      { model: Genre, as: "genres" },
    ],
    order: [["rank", "DESC"]],
    limit,
  });
}

async function findTracksByGenreId(genreId) {
  const tracks = await Track.findAll({
    attributes: ["id"],
    include: [
      {
        model: Genre,
        as: "genres",
        where: { id: genreId },
        attributes: [],
      },
    ],
  });
  const trackIds = tracks.map((tr) => tr.id);

  if (trackIds.length === 0) {
    return [];
  }

  return Track.findAll({
    where: { id: { [Op.in]: trackIds } },
    include: [
      { model: Genre, as: "genres" },
      { model: Artist, as: "artists" },
    ],
    order: [["rank", "DESC"]],
  });
}

async function findTrackById(id) {
  return Track.findByPk(id, {
    include: [
      { model: Artist, as: "artists" },
      { model: Genre, as: "genres" },
    ],
  });
}

module.exports = {
  //saveTrack,
  findTracksSortedByRank,
  findSearchedTracksSorted,
  findTracksByAlbumId,
  findTracksByArtistId,
  findTracksByGenreId,
  findTrackById,
};
