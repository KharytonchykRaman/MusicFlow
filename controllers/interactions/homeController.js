const homeService = require("../../services/interactions/homeService");

const home = async (req, res) => {
  try {
    const homePageData = await homeService.getHomePageData();

    res.json({ status: "success", data: homePageData });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ status: "error", message: error.message });
  }
};

module.exports = { home };
