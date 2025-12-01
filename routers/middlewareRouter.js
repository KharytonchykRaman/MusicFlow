const express = require("express");
const { logger } = require("../utils");

const router = express.Router();

router.use(express.json());

router.use((req, res, next) => {
    logger(`${req.method} - ${req.url} time: ${new Date().toLocaleString()}\n`);

    next();
})

module.exports = router;