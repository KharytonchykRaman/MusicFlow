const fs = require("fs").promises;
const path = require("path");

const Artist = require("../../models/Artist");
const { createAsyncSearch } = require("../../utils");

const ARTIST_FILE_PATH = path.join(__dirname, "..", "mocked", "artists.json");

let cachedArtists = null;

async function getArtistsFromFile() {
  const data = await fs.readFile(ARTIST_FILE_PATH, "utf8");
  return JSON.parse(data);
}

async function cacheArtists() {
  const artistsFromFile = await getArtistsFromFile();
  cachedArtists = artistsFromFile.map((ar) =>
    Artist.create(ar.id, ar.name, ar.picture, ar.fans)
  );
}

const getArtists = async () => {
  if (cachedArtists === null) {
    await cacheArtists();
  }
  return cachedArtists;
};

const findSearchedPlaylists = createAsyncSearch(getArtistsFromFile, ["name"]);

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

  const artistDTO = artist.toDTO();
  artistsFromFile.push(artistDTO);

  await fs.writeFile(
    PLAYLIST_FILE_PATH,
    JSON.stringify(artistsFromFile, null, 2)
  );

  cachedArtists.push(artist);
}

module.exports = {
  getArtists,
  saveArtist,
  findArtistsSortedByFans,
  findSearchedPlaylists,
};
