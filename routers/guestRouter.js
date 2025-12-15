const express = require("express");
const homeController = require("../controllers/interactions/homeController");
const searchController = require("../controllers/interactions/searchController");

const router = express.Router();

router.get("/home", (req, res) => homeController.home(req, res));

router.get("/search", (req, res) => searchController.search(req, res));

module.exports = router;
