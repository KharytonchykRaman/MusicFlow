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
    throw new Error(`Track with id ${track.id} already exists`);
  }

  tracksData.push(track);

  await fs.writeFile(TRACK_FILE_PATH, JSON.stringify(tracksData, null, 2));
}

module.exports = {
  saveTrack,
  findTracksSortedByRank,
  findSearchedTracks,
};
