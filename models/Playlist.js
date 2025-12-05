const PLAYLIST_PRIVATE_SYMBOL = Symbol("PLAYLIST_PRIVATE");

class Playlist {
  #id;
  #name;
  #popularity;
  #tracks;

  constructor(symbol, name, popularity, tracks) {
    if (symbol !== PLAYLIST_PRIVATE_SYMBOL) {
      throw new Error("Track: use Track.create() instead of new Track()");
    }
    this.#id = new Date().getTime();
    this.#name = name;
    this.#popularity = popularity;
    this.#tracks = tracks;
  }

  static create(name, popularity = 0, tracks = []) {
    if (!name) {
      throw new Error("Playlist must have name field");
    }

    return new Playlist(PLAYLIST_PRIVATE_SYMBOL, name, popularity, tracks);
  }

  getId() {
    return this.#id;
  }
  getName() {
    return this.#name;
  }
  getPopularity() {
    return this.#popularity;
  }
  getTracks() {
    return this.#tracks;
  }

  static validate(data) {
    const items = Array.isArray(data) ? data : [data];

    if (!items.every((item) => item.name && item.id)) {
      throw new Error("Playlist must have name and id fields");
    }

    return true;
  }

  toDTO() {
    return {
      id: this.#id,
      name: this.#name,
      popularity: this.#popularity,
      tracks: this.#tracks,
    };
  }
}

module.exports = Playlist;
