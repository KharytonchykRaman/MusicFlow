const fs = require("fs").promises;
const { LOGS_FILE_PATH } = require("../data/FileManager");

const logger = async (data, isError = false) => {
  try {
    if (isError) {
      await fs.appendFile(LOGS_FILE_PATH, `\n\n\n`, { encoding: "utf-8" });
    }
    await fs.appendFile(LOGS_FILE_PATH, `${JSON.stringify(data, null, 2)}\n`, {
      encoding: "utf-8",
    });
  } catch (err) {
    console.error("Ошибка при записи логов:", err);
  }
};

module.exports = { logger };
