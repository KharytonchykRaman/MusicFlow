const fs = require("fs").promises;
const path = require("path");

const Album = require("../../models/Album");
const { createAsyncSearch } = require("../../utils");

const ALBUM_FILE_PATH = path.join(__dirname, "..", "mocked", "albums.json");

let cachedAlbums = null;

async function getAlbumsFromFile() {
  const data = await fs.readFile(ALBUM_FILE_PATH, "utf8");
  return JSON.parse(data);
}

async function cacheAlbums() {
  const albumsFromFile = await getAlbumsFromFile();
  cachedAlbums = albumsFromFile.map((al) =>
    Album.create(
      al.id,
      al.title,
      al.cover,
      al.label,
      al.userId,
      al.visibility,
      al.nb_tracks,
      al.fans,
      al.tracklist
    )
  );
}

const getAlbums = async () => {
  if (cachedAlbums === null) {
    await cacheAlbums();
  }
  return cachedAlbums;
};

const findSearchedAlbums = createAsyncSearch(getAlbumsFromFile, [
  "title",
  "label",
]);

async function findAlbumsSortedByFans(limit) {
  const albumsFromFile = await getAlbumsFromFile();
  return albumsFromFile.sort((a, b) => b.fans - a.fans).slice(0, limit);
}

async function saveAlbum(album) {
  const albumsFromFile = await getAlbumsFromFile();

  if (albumsFromFile.some((al) => al.id === album.id)) {
    const err = new Error(`Album with id ${album.id} already exists`);
    err.status = 400;
    throw err;
  }

  const albumDTO = album.toDTO();
  albumsFromFile.push(albumDTO);

  await fs.writeFile(ALBUM_FILE_PATH, JSON.stringify(albumsFromFile, null, 2));

  cachedAlbums.push(album);
}

module.exports = {
  getAlbums,
  findSearchedAlbums,
  findAlbumsSortedByFans,
  saveAlbum,
};
