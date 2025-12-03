const { createSearch } = require("../utils");

// const tracks =

const search = createSearch(albums, ["name"]);

module.exports = { search };
