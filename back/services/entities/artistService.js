const repository = require("../../data/repositories/artistRepository");

async function getPopularArtists(limit = 10) {
  const artists = await repository.findArtistsSortedByFans(limit);
  const DTOs = artists.map((ar) => ar.toFull());
  return DTOs;
}

async function getSearchedArtists(q, limit) {
  const artists = await repository.findSearchedArtistsSorted(q, limit);
  const DTOs = artists.map((ar) => ar.toFull());
  return DTOs;
}

async function getArtistById(id) {
  const artist = await repository.findArtistById(id);
  if (!artist) {
    const newError = new Error(`Artist with id ${id} not found`);
    newError.status = 400;
    throw newError;
  }
  return artist.toFull();
}

module.exports = {
  getSearchedArtists,
  getPopularArtists,
  getArtistById,
};
