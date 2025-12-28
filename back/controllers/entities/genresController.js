const trackService = require("../../services/entities/trackService");

async function getTracks(req, res) {
  try {
    const { id } = req.params;

    const tracks = await trackService.getTracksByGenreId(id);
    res.json(tracks);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getTracks };