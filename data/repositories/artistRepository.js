const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");

const getArtists = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "..", "mocked", "artists.json"),
      "utf8"
    );
    const artists = JSON.parse(data);
    return artists;
  } catch (error) {
    logger(JSON.stringify(error), true);
    const newError = new Error('Can not read file: artists.json');
    newError.status = 500;
    throw newError;
  }
};

module.exports = { getArtists };
