const repository = require("../../data/repositories/trackRepository");
const artistRepo = require("../../data/repositories/artistRepository");
const albumRepo = require("../../data/repositories/albumRepository");
const genreRepo = require("../../data/repositories/genreRepository");

async function getPopularTracks(limit = 20) {
  const tracks = await repository.findTracksSortedByRank(limit);
  const DTOs = tracks.map((tr) => tr.toFull());
  return DTOs;
}

async function getSearchedTracks(q, limit) {
  const tracks = await repository.findSearchedTracksSorted(q, limit);
  const DTOs = tracks.map((tr) => tr.toFull());
  return DTOs;
}

async function getTracksByAlbumId(albumId) {
  const album = await albumRepo.findCompactAlbumById(albumId);
  if (!album) {
    const newError = new Error(`Album with id ${albumId} not found`);
    newError.status = 400;
    throw newError;
  }

  const tracks = await repository.findTracksByAlbumId(albumId);
  const DTOs = tracks.map((tr) => tr.toFull());
  return DTOs;
}

async function getTracksByArtistId(artistId) {
  const artist = await artistRepo.findArtistById(artistId);
  if (!artist) {
    const newError = new Error(`Artist with id ${artistId} not found`);
    newError.status = 400;
    throw newError;
  }

  const tracks = await repository.findTracksByArtistId(artistId);
  const DTOs = tracks.map((tr) => tr.toFull());
  return DTOs;
}

async function getTracksByGenreId(genreId) {
  const genre = await genreRepo.findById(genreId);
  if (!genre) {
    const newError = new Error(`Genre with id ${genreId} not found`);
    newError.status = 400;
    throw newError;
  }

  const tracks = await repository.findTracksByGenreId(genreId);
  const DTOs = tracks.map((tr) => tr.toFull());
  return DTOs;
}

async function getTrackById(id) {
  const track = await repository.findTrackById(id);
  if (!track) {
    const newError = new Error(`Track with id ${id} not found`);
    newError.status = 400;
    throw newError;
  }
  return track.toFull();
}

module.exports = {
  getPopularTracks,
  getSearchedTracks,
  getTracksByAlbumId,
  getTracksByArtistId,
  getTracksByGenreId,
  getTrackById,
};
