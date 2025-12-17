const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");

const getTracks = async () => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "..", "mocked", "tracks.json"),
      "utf8"
    );
    const tracks = JSON.parse(data);
    return tracks;
  } catch (error) {
    logger(error.message, true);
    const newError = new Error("Can not read file: tracks.json");
    newError.status = 500;
    throw newError;
  }
};

module.exports = { getTracks };
