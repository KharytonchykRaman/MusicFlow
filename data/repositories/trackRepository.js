const fs = require("fs").promises;
const path = require("path");

const Track = require("../../models/Track");
const { createAsyncSearch } = require("../../utils");

const TRACK_FILE_PATH = path.join(
  __dirname,
  "..",
  "mocked",
  "tracks.json"
);

let cachedTracks = null;

async function getTracksFromFile() {
  const data = await fs.readFile(TRACK_FILE_PATH, "utf8");
  return JSON.parse(data);
}

async function cacheTracks() {
  const tracksFromFile = await getTracksFromFile();
  cachedTracks = tracksFromFile.map((tr) =>
    Track.create(tr.id, tr.title, tr.rank, tr.preview, tr.contributors, tr.artist, tr.album)
  );
}

const getTracks = async () => {
  if (cachedTracks === null) {
    await cacheTracks();
  }
  return cachedTracks;
};

const findSearchedTracks = createAsyncSearch(getTracksFromFile, ["title"]);

async function findTracksSortedByRank(limit) {
  const tracksFromFile = await getTracksFromFile();
  return tracksFromFile
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit);
}

async function saveTrack(track) {
  const tracksFromFile = await getTracksFromFile();

  if (tracksFromFile.some((tr) => tr.id === track.id)) {
    const err = new Error(`Track with id ${track.id} already exists`);
    err.status = 400;
    throw err;
  }

  const trackDTO = track.toDTO();
  tracksFromFile.push(trackDTO);

  await fs.writeFile(
    TRACK_FILE_PATH,
    JSON.stringify(tracksFromFile, null, 2)
  );

  cachedTracks.push(track);
}

module.exports = {
  getTracks,
  saveTrack,
  findTracksSortedByRank,
  findSearchedTracks,
};
