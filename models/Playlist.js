const { getPlaylists } = require("../data/repositories/playlistRepository");

class Playlist {
  static async getPopularPlaylists(limit = 20) {
    const playlists = await getPlaylists();
    const sorted = playlists.sort((a, b) => b.fans - a.fans);
    return sorted.slice(0, limit);
  }
}

module.exports = Playlist;
