const express = require("express");
const tracksController = require("../controllers/tracksController");
const artistsController = require("../controllers/artistsController");
const genresController = require("../controllers/genresController");

const router = express.Router();

const PLAYLIST_LENGTH = 20;

router.get("/api/home", (req, res) => {
    const result = {
        genres: {},
        artists: {},
    };

    try {
        const popularGenres = genresController.getPopularGenres();

        for (const genre of popularGenres) {
            result.genres[genre] = getPopularTracksByGenre(genre, PLAYLIST_LENGTH);
        }

        const popularArtists = artistsController.getPopularArtists();

        for (const artist of popularArtists) {
            result.artists[artist] = getPopularTracksByArtist(genre, PLAYLIST_LENGTH);
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error,
        })
    }
})

module.exports = router;