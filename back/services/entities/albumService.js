const repository = require("../../data/repositories/albumRepository");
const artistRepo = require("../../data/repositories/artistRepository");

async function getPopularAlbums(limit = 10) {
  const albums = await repository.findAlbumsSortedByFans(limit);
  const DTOs = albums.map((al) => al.toCompact());
  return DTOs;
}

async function getSearchedAlbums(q, limit) {
  const albums = await repository.findSearchedAlbumsSorted(q, limit);
  const DTOs = albums.map((al) => al.toCompact());
  return DTOs;
}

async function getAlbumById(id) {
  const album = await repository.findFullAlbumById(id);
  if (!album) {
    const newError = new Error(`Album with id ${id} not found`);
    newError.status = 400;
    throw newError;
  }
  return album.toFull();
}

async function getAlbumsByArtistId(artistId) {
  const artist = await artistRepo.findArtistById(artistId);
  if (!artist) {
    const newError = new Error(`Artist with id ${artistId} not found`);
    newError.status = 400;
    throw newError;
  }

  const albums = await repository.findAlbumsByArtistId(artistId);
  const DTOs = albums.map((al) => al.toCompact());
  return DTOs;
}

module.exports = {
  getSearchedAlbums,
  getPopularAlbums,
  getAlbumById,
  getAlbumsByArtistId,
};
