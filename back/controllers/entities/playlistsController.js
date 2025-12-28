const trackService = require("../../services/entities/trackService");
const playlistService = require("../../services/entities/playlistService");

async function getPlaylist(req, res) {
  try {
    const { id } = req.params;

    const playlist = await playlistService.getPlaylistById(id);

    const result = await playlistService.fillPlaylist(playlist);
    res.json(result);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getPlaylist };
