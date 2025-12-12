const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");

const getPlaylists = async () => {
  try {
    const data = await fs.readFile(
      path.join("..", "mocked", "playlists.json"),
      "utf8"
    );
    const playlists = JSON.parse(data);
    return playlists;
  } catch (error) {
    logger(JSON.stringify(error), true);
    return [];
  }
};

module.exports = { getPlaylists };
