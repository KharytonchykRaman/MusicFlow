const ARTIST_PRIVATE_SYMBOL = Symbol("ARTIST_PRIVATE");
const { getArtists } = require("../data/repositories/artistRepository");

class Artist {
  #id;
  #name;
  #picture;
  #fans;
  #type;
  #albumlist;

  constructor(symbol, name, picture, fans, type, albumlist) {
    if (symbol !== ARTIST_PRIVATE_SYMBOL) {
      throw new Error("Artist: use Artist.create() instead of new Artist()");
    }

    this.#id = new Date().getTime();
    this.#name = name;
    this.#picture = picture;
    this.#fans = fans;
    this.#type = type;
    this.#albumlist = structuredClone(albumlist);
  }

  static create(name, picture, fans, type, albumlist) {
    return new Artist(
      ARTIST_PRIVATE_SYMBOL,
      name,
      picture,
      fans,
      type,
      albumlist
    );
  }

  static async getPopularArtists(limit = 20) {
    const artists = await getArtists();
    const sorted = artists.sort((a, b) => b.fans - a.fans);
    return sorted.slice(0, limit);
  }

  static validate(data) { }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get picture() {
    return this.#picture;
  }

  get fans() {
    return this.#fans;
  }

  get type() {
    return this.#type;
  }

  get albumlist() {
    return structuredClone(this.#albumlist);
  }

  toDTO() {
    return {
      id: this.#id,
      name: this.#name,
      picture: this.#picture,
      fans: this.#fans,
      type: this.#type,
      albumlist: structuredClone(this.#albumlist),
    };
  }
}

module.exports = Artist;
