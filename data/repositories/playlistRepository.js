const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");
const { playlists } = require("./index");
const PLAYLIST_FILE_PATH = path.join(
  __dirname,
  "..",
  "mocked",
  "playlists.json"
);

const getPlaylists = async () => {
  try {
    const data = await fs.readFile(PLAYLIST_FILE_PATH, "utf8");
    const playlists = JSON.parse(data);
    return playlists;
  } catch (error) {
    logger(JSON.stringify(error), true);
    const newError = new Error("Can not read file: playlists.json");
    newError.status = 500;
    throw newError;
  }
};

async function savePlaylist(playlist) {
  try {
    const rawData = await fs.readFile(PLAYLIST_FILE_PATH, "utf8");
    const playlistsFromFile = JSON.parse(rawData);

    const playlistDTO = playlist.toDTO();

    const exists = playlistsFromFile.some((p) => p.id === playlistDTO.id);
    if (exists) {
      const newError = new Error(
        `Playlist with id ${playlistDTO.id} already exists`
      );
      newError.status = 400;
      throw newError;
    }

    playlistsFromFile.push(playlistDTO);

    await fs.writeFile(PLAYLIST_FILE_PATH, JSON.stringify(playlists, null, 2));

    playlists.push(playlist);
  } catch (error) {
    logger(JSON.stringify(error), true);
    const newError = new Error(`Error saving playlist: ${error.message}`);
    newError.status = 500;
    throw newError;
  }
}

module.exports = { getPlaylists, savePlaylist };
