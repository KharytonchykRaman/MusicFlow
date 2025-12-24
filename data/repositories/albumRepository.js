const fs = require("fs").promises;
const path = require("path");

const { createAsyncSearch } = require("../../utils");

const ALBUM_FILE_PATH = path.join(__dirname, "..", "mocked", "albums.json");

async function getAlbumsFromFile() {
  const data = await fs.readFile(ALBUM_FILE_PATH, "utf8");
  return JSON.parse(data);
}

const findSearchedAlbums = createAsyncSearch(getAlbumsFromFile, [
  "title",
  "label",
]);

async function findAlbumsSortedByFans(limit) {
  const albumsData = await getAlbumsFromFile();
  return albumsData.sort((a, b) => b.fans - a.fans).slice(0, limit);
}

async function saveAlbum(album) {
  const albumsData = await getAlbumsFromFile();

  if (albumsData.some((al) => al.id === album.id)) {
    throw new Error(`Album with id ${album.id} already exists`);
  }

  albumsData.push(album);

  await fs.writeFile(ALBUM_FILE_PATH, JSON.stringify(albumsData, null, 2));
}

module.exports = {
  findSearchedAlbums,
  findAlbumsSortedByFans,
  saveAlbum,
};
