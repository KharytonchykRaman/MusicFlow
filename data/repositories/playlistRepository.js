const fs = require("fs").promises;
const path = require("path");

const { logger } = require("../../utils");
const { playlists } = require("./index");
const Playlist = require("../../models/Playlist");

const PLAYLIST_FILE_PATH = path.join(
  __dirname,
  "..",
  "mocked",
  "playlists.json"
);

async function getPlaylistsFromFile() {
  try {
    const data = await fs.readFile(PLAYLIST_FILE_PATH, "utf8");
    const playlistsFromFile = JSON.parse(data);
    return playlistsFromFile;
  } catch (error) {
    logger(error.message, true);
    const newError = new Error("Can not read file: playlists.json");
    newError.status = 500;
    throw newError;
  }
}

const getPlaylists = async () => {
  try {
    const playlistsFromFile = await getPlaylistsFromFile();
    const result = playlistsFromFile.map((pl) =>
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
    return result;
  } catch (error) {
    throw error;
  }
};

async function savePlaylist(playlist) {
  try {
    const playlistsFromFile = await getPlaylistsFromFile();
    try {
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

      await fs.writeFile(
        PLAYLIST_FILE_PATH,
        JSON.stringify(playlistsFromFile, null, 2)
      );

      playlists.push(playlist);
    } catch (error) {
      logger(error.message, true);
      const newError = new Error(`Error saving playlist: ${error.message}`);
      newError.status = 500;
      throw newError;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = { getPlaylists, savePlaylist, getPlaylistsFromFile };
