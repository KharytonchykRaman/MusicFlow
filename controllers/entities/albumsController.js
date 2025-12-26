const trackService = require("../../services/entities/trackService");
const albumService = require("../../services/entities/albumService");

async function getTracks(req, res) {
  try {
    const { id } = req.params;

    await albumService.getAlbumById(id);

    const tracks = await trackService.getTracksByAlbumId(id);
    res.json(tracks);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getTracks };
