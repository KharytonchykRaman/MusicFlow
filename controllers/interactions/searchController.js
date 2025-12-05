const searchService = require("../../services/interactions/searchService");

const search = (req, res) => {
  try {
    const { q } = req.query;
    const searchedData = searchService.search(q);

    res.json({ status: "success", data: searchedData });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ status: "error", message: error });
  }
};

module.exports = { search };
