const path = require("path");

const MUSIC_FOLDER_PATH = path.join(__dirname, "tracks"); // потом убрать и в exports
const LOGS_FILE_PATH = path.join(__dirname, "..", "logs.txt");
const PUBLIC_FOLDER_PATH = path.join(__dirname, "..", "public");
const HTML_PAGE_PATH = path.join(__dirname, "..", "public", "index.html");

module.exports = { MUSIC_FOLDER_PATH, LOGS_FILE_PATH, PUBLIC_FOLDER_PATH, HTML_PAGE_PATH }