const express = require("express");
const homeController = require("../controllers/interactions/homeController");
const searchController = require("../controllers/interactions/searchController");
const albumsController = require("../controllers/entities/albumsController");

const router = express.Router();

router.get("/home", (req, res) => homeController.home(req, res));

router.get("/search", (req, res) => searchController.search(req, res));

router.get("/albums/:id/tracks", (req, res) =>
  albumsController.getTracks(req, res)
);

module.exports = router;
