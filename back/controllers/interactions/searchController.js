const searchService = require("../../services/interactions/searchService");

const search = async (req, res) => {
  try {
    const { q } = req.query;
    const trackLimit = 20;
    const playlistLimit = 10;
    const searchedData = await searchService.search(
      q,
      trackLimit,
      playlistLimit
    );

    res.json({ status: "success", data: searchedData });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ status: "error", message: error.message });
  }
};

module.exports = { search };
