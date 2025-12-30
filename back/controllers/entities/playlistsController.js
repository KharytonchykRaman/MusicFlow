const playlistService = require("../../services/entities/playlistService");

async function getPlaylist(req, res) {
  try {
    const id = Number(req.params.id);

    const playlist = await playlistService.getPlaylistById(id);

    res.json(playlist);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getPlaylist };
