const fs = require("fs").promises;
const { LOGS_FILE_PATH } = require("../data/FileManager");

const logger = async (data, isError = false) => {
  try {
    if (isError) {
      await fs.appendFile(LOGS_FILE_PATH, `\n\n\n`, { encoding: "utf-8" });
    }
    await fs.appendFile(
      LOGS_FILE_PATH,
      `${JSON.stringify(data, null, 2)}\n`,
      {
        encoding: "utf-8",
      }
    );
  } catch (err) {
    console.error("Ошибка при записи логов:", err);
  }
};  

const createAsyncSearch = (getCollectionAsync, searchableFields = ["name", "title", "label"]) => {
  return async (query, limit = 20) => {
    if (!query || typeof query !== "string") {
      return [];
    }

    let collection;
    try {
      collection = await getCollectionAsync();
    } catch (error) {
      logger(`Failed to fetch collection for search: ${error.message}`, true);
      return [];
    }

    const q = query.toLowerCase();

    const result = collection.filter((item) => {
      return searchableFields.some((field) => {
        return item[field] && item[field].toString().toLowerCase().includes(q);
      });
    });

    return result.slice(0, limit);
  };
};

const pipe = (func) => { };

const compose = (func) => { };

function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

module.exports = { logger, pipe, compose, curry, createAsyncSearch };
