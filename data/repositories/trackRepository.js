const fs = require("fs").promises;
const path = require("path");

const { createAsyncSearch } = require("../../utils");

const TRACK_FILE_PATH = path.join(__dirname, "..", "mocked", "tracks.json");

async function getTracksFromFile() {
  const data = await fs.readFile(TRACK_FILE_PATH, "utf8");
  return JSON.parse(data);
}

const findSearchedTracks = createAsyncSearch(getTracksFromFile, ["title"]);

async function findTracksSortedByRank(limit) {
  const tracksData = await getTracksFromFile();
  return tracksData.sort((a, b) => b.rank - a.rank).slice(0, limit);
}

async function saveTrack(track) {
  const tracksData = await getTracksFromFile();

  if (tracksData.some((tr) => tr.id === track.id)) {
    const err = new Error(`Track with id ${track.id} already exists`);
    err.status = 400;
    throw err;
  }

  tracksData.push(track);

  await fs.writeFile(TRACK_FILE_PATH, JSON.stringify(tracksData, null, 2));
}

async function findTracksByAlbumId(albumId) {
  const tracksData = await getTracksFromFile();

  return tracksData.filter((tr) => tr.albumId === albumId);
}

async function findTracksByArtistId(artistId) {
  const tracksData = await getTracksFromFile();

  return tracksData.filter((tr) => tr.artist.id === artistId);
}

async function findTracksByGenreId(genreId) {
  const tracksData = await getTracksFromFile();

  return tracksData.filter((tr) => tr.genres.some((g) => g.id === genreId));
}

module.exports = {
  saveTrack,
  findTracksSortedByRank,
  findSearchedTracks,
  findTracksByAlbumId,
  findTracksByArtistId,
  findTracksByGenreId,
};
