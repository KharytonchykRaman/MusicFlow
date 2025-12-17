const ARTIST_PRIVATE_SYMBOL = Symbol("ARTIST_PRIVATE");

class Artist {
  #id;
  #name;
  #picture;
  #fans;
  #type;
  #albumlist;

  constructor(symbol, id, name, picture, fans, albumlist) {
    if (symbol !== ARTIST_PRIVATE_SYMBOL) {
      throw new Error("Artist: use Artist.create() instead of new Artist()");
    }

    this.#id = id;
    this.#name = name;
    this.#picture = picture;
    this.#fans = fans;
    this.#type = "Artist";
    this.#albumlist = structuredClone(albumlist);
  }

  static create(id, name, picture, fans, albumlist) {
    return new Artist(
      ARTIST_PRIVATE_SYMBOL,
      id,
      name,
      picture,
      fans,
      type,
      albumlist
    );
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
