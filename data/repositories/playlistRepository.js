const fs = require("fs").promises;
const path = require("path");

const { createAsyncSearch } = require("../../utils");

const PLAYLIST_FILE_PATH = path.join(
  __dirname,
  "..",
  "mocked",
  "playlists.json"
);

async function getPlaylistsFromFile() {
  const data = await fs.readFile(PLAYLIST_FILE_PATH, "utf8");
  return JSON.parse(data);
}

const findSearchedPlaylists = createAsyncSearch(getPlaylistsFromFile, [
  "title",
  "label",
]);

async function findPublicPlaylistsSortedByFans(limit) {
  const playlistsFromFile = await getPlaylistsFromFile();
  return playlistsFromFile
    .filter((p) => p.visibility === "public")
    .sort((a, b) => b.fans - a.fans)
    .slice(0, limit);
}

async function savePlaylist(playlist) {
  const playlistsFromFile = await getPlaylistsFromFile();

  if (playlistsFromFile.some((p) => p.id === playlist.id)) {
    const err = new Error(`Playlist with id ${playlist.id} already exists`);
    err.status = 400;
    throw err;
  }

  playlistsFromFile.push(playlist);

  await fs.writeFile(
    PLAYLIST_FILE_PATH,
    JSON.stringify(playlistsFromFile, null, 2)
  );
}

module.exports = {
  savePlaylist,
  findPublicPlaylistsSortedByFans,
  findSearchedPlaylists,
};
