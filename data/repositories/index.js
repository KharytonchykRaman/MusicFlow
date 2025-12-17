const { getAlbums } = require("./albumRepository");
const { getArtists } = require("./artistRepository");
const { getTracks } = require("./trackRepository");
const { getPlaylists } = require("./playlistRepository");

const artists = await getArtists();
const albums = await getAlbums();
const tracks = await getTracks();
const playlists = await getPlaylists();


module.exports = { artists, albums, tracks, playlists };
