const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");

const getAlbums = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "..", "mocked", "albums.json"),
      "utf8"
    );
    const albums = JSON.parse(data);
    return albums;
  } catch (error) {
    logger(error.message, true);
    const newError = new Error('Can not read file: albums.json');
    newError.status = 500;
    throw newError;
  }
};

module.exports = { getAlbums };
