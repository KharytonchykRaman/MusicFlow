const artistService = require("../../services/entities/artistService");
const albumService = require("../../services/entities/albumService");
const trackService = require("../../services/entities/trackService");

async function getArtist(req, res) {
  try {
    const { id } = req.params;

    const artist = await artistService.getArtistById(id);

    const albums = await albumService.getAlbumsByArtistId(id);
    res.json({ ...artist, albums });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

async function getTracks(req, res) {
  try {
    const { id } = req.params;

    await artistService.getArtistById(id);

    const tracks = await trackService.getTracksByArtistId(id);
    res.json(tracks);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getArtist, getTracks };
