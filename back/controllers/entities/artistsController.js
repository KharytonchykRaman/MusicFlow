const artistService = require("../../services/entities/artistService");
const albumService = require("../../services/entities/albumService");
const trackService = require("../../services/entities/trackService");

async function getArtist(req, res) {
  try {
    const id = Number(req.params.id);

    const artist = await artistService.getArtistById(id);

    const albums = await albumService.getAlbumsByArtistId(id);

    const limit = 10;
    const topTracks = await trackService.getTracksByArtistId(id, limit);
    res.json({ ...artist, albums, topTracks });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

async function getTracks(req, res) {
  try {
    const id = Number(req.params.id);

    const tracks = await trackService.getTracksByArtistId(id);
    res.json(tracks);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ status: "error", message: err.message });
  }
}

module.exports = { getArtist, getTracks };
