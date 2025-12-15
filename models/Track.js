const TRACK_PRIVATE_SYMBOL = Symbol("TRACK_PRIVATE");

class Track {
  #id;
  #title;
  #rank;
  #preview;
  #type;
  #contributors;
  #artist;
  #album;

  constructor(symbol, title, rank, preview, contributors, artist, album) {
    if (symbol !== TRACK_PRIVATE_SYMBOL) {
      throw new Error("Track: use Track.create() instead of new Track()");
    }
    this.#id = new Date().getTime();
    this.#title = title;
    this.#rank = rank;
    this.#preview = preview;
    this.#type = type;
    this.#contributors = structuredClone(contributors);
    this.#artist = { ...artist };
    this.#album = { ...album };
  }

  static create(title, rank, preview, contributors, artist, album) {
    return new Track(
      TRACK_PRIVATE_SYMBOL,
      title,
      rank,
      preview,
      contributors,
      artist,
      album
    );
  }

  static validate(obj) {}

  get id() {
    return this.#id;
  }
  get title() {
    return this.#title;
  }
  get rank() {
    return this.#rank;
  }
  get preview() {
    return this.#preview;
  }
  get type() {
    return this.#type;
  }
  get contributors() {
    return structuredClone(this.#contributors);
  }
  get artist() {
    return { ...this.#artist };
  }
  get album() {
    return { ...this.#album };
  }

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      rank: this.#rank,
      preview: this.#preview,
      type: this.#type,
      contributors: structuredClone(this.#contributors),
      artist: { ...this.#artist },
      album: { ...this.#album },
    };
  }
}

module.exports = Track;
