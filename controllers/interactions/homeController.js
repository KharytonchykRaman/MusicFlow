const homeService = require("../../services/interactions/homeService");

const home = (req, res) => {
  try {
    const homePageData = homeService.getHomePageData();

    res.json({ status: "success", data: homePageData });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ status: "error", message: error });
  }
};

module.exports = { home };
