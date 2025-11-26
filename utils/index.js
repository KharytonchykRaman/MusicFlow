const fs = require("fs").promises;
const { LOGS_FILE_PATH } = require("../data/FileManager")

const logger = (data) => {
    try {
        await fs.writeFile(LOGS_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`);
    } catch (err) {
        console.error('Ошибка при записи логов:', err);
    }
}