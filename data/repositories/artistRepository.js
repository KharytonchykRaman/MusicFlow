const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../../utils");

const getArtists = async () => {
    try {
        const data = await fs.readFile(path.join("..", "mocked", "artists.json"), 'utf8');
        const artists = JSON.parse(data);
        return artists;
    } catch (error) {
        logger(error, true);
        return [];
    }
};

module.exports = { getArtists }