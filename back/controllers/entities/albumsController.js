const albumService = require("../../services/entities/albumService");

async function getAlbum(req, res) {
  try {
    const id = Number(req.params.id);

    const album = await albumService.getAlbumById(id);

    res.json(album);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getAlbum };
