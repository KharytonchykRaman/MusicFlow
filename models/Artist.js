const ARTIST_PRIVATE_SYMBOL = Symbol("ARTIST_PRIVATE");

class Artist {
  #id;
  #name;
  #picture;
  #fans;

  constructor(symbol, id, name, picture) {
    if (symbol !== ARTIST_PRIVATE_SYMBOL) {
      throw new Error("Artist: use Artist.create() instead of new Artist()");
    }

    this.#id = id;
    this.#name = name;
    this.#picture = picture;
    this.#fans = fans;
  }

  static create(id, name, picture, fans) {
    return new Artist(ARTIST_PRIVATE_SYMBOL, id, name, picture, fans);
  }

  static validate(data) {}

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

  toDTO() {
    return {
      id: this.#id,
      name: this.#name,
      picture: this.#picture,
      fans: this.#fans,
    };
  }
}

module.exports = Artist;
