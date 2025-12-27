const express = require("express");
const homeController = require("../controllers/interactions/homeController");
const searchController = require("../controllers/interactions/searchController");
const albumsController = require("../controllers/entities/albumsController");
const artistsController = require("../controllers/entities/artistsController");
const genresController = require("../controllers/entities/genresController");

const router = express.Router();

router.get("/home", (req, res) => homeController.home(req, res));

router.get("/search", (req, res) => searchController.search(req, res));

router.get("/albums/:id/tracks", (req, res) =>
  albumsController.getTracks(req, res)
);

router.get("/artists/:id/albums", (req, res) =>
  artistsController.getAlbums(req, res)
);

router.get("/artists/:id/tracks", (req, res) =>
  artistsController.getTracks(req, res)
);

router.get("/genres/:id/tracks", (req, res) =>
  genresController.getTracks(req, res)
);

module.exports = router;
