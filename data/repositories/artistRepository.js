const fs = require("fs").promises;
const path = require("path");

const { createAsyncSearch } = require("../../utils");

const ARTIST_FILE_PATH = path.join(__dirname, "..", "mocked", "artists.json");

async function getArtistsFromFile() {
  const data = await fs.readFile(ARTIST_FILE_PATH, "utf8");
  return JSON.parse(data);
}

const findSearchedArtists = createAsyncSearch(getArtistsFromFile, ["name"]);

async function findArtistsSortedByFans(limit) {
  const artistsFromFile = await getArtistsFromFile();
  return artistsFromFile.sort((a, b) => b.fans - a.fans).slice(0, limit);
}

async function saveArtist(artist) {
  const artistsFromFile = await getArtistsFromFile();

  if (artistsFromFile.some((ar) => ar.id === artist.id)) {
    const err = new Error(`Artists with id ${artist.id} already exists`);
    err.status = 400;
    throw err;
  }

  artistsFromFile.push(artist);

  await fs.writeFile(
    PLAYLIST_FILE_PATH,
    JSON.stringify(artistsFromFile, null, 2)
  );
}

module.exports = {
  saveArtist,
  findArtistsSortedByFans,
  findSearchedArtists,
};
