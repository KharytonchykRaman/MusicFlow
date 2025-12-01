const fs = require("fs").promises;
const { LOGS_FILE_PATH } = require("../data/FileManager")

const logger = (data) => {
    try {
        await fs.appendFile(LOGS_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`, { encoding: "utf-8" });
    } catch (err) {
        console.error('Ошибка при записи логов:', err);
    }
}

const search = (q) => {

}

const pipe = (func) => { }

const compose = (func) => { }

const carry = (func) => { }

module.exports = { logger, pipe, compose, carry, search }