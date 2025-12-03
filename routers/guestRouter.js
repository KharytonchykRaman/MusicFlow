const express = require("express");
const tracksController = require("../controllers/tracksController");
const artistsController = require("../controllers/artistsController");
const albumsController = require("../controllers/albumsController");
const genresController = require("../controllers/genresController");
const playlistsController = require("../controllers/playlistsController");

const router = express.Router();

const PLAYLIST_LENGTH = 20;

router.get("/api/home", (req, res) => {
  const result = {
    genres: {},
    artists: {},
    albums: {},
    playlists: {},
  };

  try {
    const popularGenres = genresController.getPopularGenres();

    for (const genre of popularGenres) {
      result.genres[genre.name] = tracksController.getPopularTracksByGenre(
        genre.id,
        PLAYLIST_LENGTH
      );
    }

    const popularArtists = artistsController.getPopularArtists();

    for (const artist of popularArtists) {
      result.artists[artist.name] = tracksController.getPopularTracksByArtist(
        artist.id,
        PLAYLIST_LENGTH
      );
    }

    const popularAlbums = albumsController.getPopularAlbums();

    for (const album of popularAlbums) {
      result.albums[album.name] = albumsController.getTracks(album.id);
    }

    const popularPlaylists = playlistsController.getPopularPlaylists();

    for (const playlist of popularPlaylists) {
      result.playlists[playlist.name] = playlistsController.getTracks(
        playlist.id
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
});

router.get("/api/search", (req, res) => {
  const { q } = req.query;
  const tracks = tracksController.search(q, 20);
  const artists = artistsController.search(q, 10);
  const playlists = playlistsController.search(q, 10);
  const albums = albumsController.search(q, 10);

  const result = {
    tracks,
    artists,
    albums,
    playlists,
  };

  res.json(result);
});

module.exports = router;
