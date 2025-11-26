const express = require("express");
const { LOGS_FILE_PATH } = require("../data/FileManager");
const fs = require("fs").promises;

const router = express.Router();

router.use(express.json());

router.use((req, res, next) => {
    try {
        await fs.writeFile(LOGS_FILE_PATH, `${req.method} - ${req.url} time: ${new Date().toLocaleString()}\n`);
    } catch (err) {
        console.error('Ошибка при записи логов:', err);
    }

    next();
})

module.exports = router;