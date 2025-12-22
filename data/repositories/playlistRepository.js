const fs = require("fs").promises;
const path = require("path");

const Playlist = require("../../models/Playlist");
const { createAsyncSearch } = require("../../utils");

const PLAYLIST_FILE_PATH = path.join(
  __dirname,
  "..",
  "mocked",
  "playlists.json"
);

let cachedPlaylists = null;

async function getPlaylistsFromFile() {
  const data = await fs.readFile(PLAYLIST_FILE_PATH, "utf8");
  return JSON.parse(data);
}

async function cachePlaylists() {
  const playlistsFromFile = await getPlaylistsFromFile();
  cachedPlaylists = playlistsFromFile.map((pl) =>
    Playlist.create(
      pl.id,
      pl.title,
      pl.cover,
      pl.label,
      pl.userId,
      pl.visibility,
      pl.nb_tracks,
      pl.fans,
      pl.tracklist
    )
  );
}

const getPlaylists = async () => {
  if (cachedPlaylists === null) {
    await cachePlaylists();
  }
  return cachedPlaylists;
};

const findSearchedPlaylists = createAsyncSearch(getPlaylistsFromFile, ["title", "label"]);

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

  const playlistDTO = playlist.toDTO();
  playlistsFromFile.push(playlistDTO);

  await fs.writeFile(
    PLAYLIST_FILE_PATH,
    JSON.stringify(playlistsFromFile, null, 2)
  );

  cachedPlaylists.push(playlist);
}

module.exports = {
  getPlaylists,
  savePlaylist,
  getPlaylistsFromFile,
  findPublicPlaylistsSortedByFans,
  findSearchedPlaylists,
};
