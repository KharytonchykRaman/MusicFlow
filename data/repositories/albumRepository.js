const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");

const getAlbums = async () => {
  try {
    const data = await fs.readFile(
      path.join("..", "mocked", "albums.json"),
      "utf8"
    );
    const albums = JSON.parse(data);
    return albums;
  } catch (error) {
    logger(JSON.stringify(error), true);
    return [];
  }
};

module.exports = { getAlbums };
