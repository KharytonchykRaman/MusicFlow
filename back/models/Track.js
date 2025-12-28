const TRACK_PRIVATE_SYMBOL = Symbol("TRACK_PRIVATE");

class Track {
  #id;
  #title;
  #rank;
  #preview;
  #track_position;
  #contributors;
  #artist;
  #albumId;
  #cover;
  #genres;

  constructor(
    symbol,
    id,
    title,
    rank,
    preview,
    track_position,
    contributors,
    artist,
    albumId,
    cover,
    genres
  ) {
    if (symbol !== TRACK_PRIVATE_SYMBOL) {
      throw new Error("Track: use Track.create() instead of new Track()");
    }
    this.#id = id;
    this.#title = title;
    this.#rank = rank;
    this.#preview = preview;
    this.#track_position = track_position;
    this.#contributors = structuredClone(contributors);
    this.#artist = { ...artist };
    this.#albumId = albumId;
    this.#cover = cover;
    this.#genres = structuredClone(genres);
  }

  static create(
    id,
    title,
    rank,
    preview,
    track_position,
    contributors,
    artist,
    albumId,
    cover,
    genres
  ) {
    return new Track(
      TRACK_PRIVATE_SYMBOL,
      id,
      title,
      rank,
      preview,
      track_position,
      contributors,
      artist,
      albumId,
      cover,
      genres
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
  get track_position() {
    return this.#track_position;
  }
  get contributors() {
    return structuredClone(this.#contributors);
  }
  get artist() {
    return { ...this.#artist };
  }
  get albumId() {
    return this.#albumId;
  }
  get cover() {
    return this.#cover;
  }
  get genres() {
    return structuredClone(this.#genres);
  }

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      rank: this.#rank,
      preview: this.#preview,
      track_position: this.#track_position,
      contributors: structuredClone(this.#contributors),
      artist: { ...this.#artist },
      albumId: this.#albumId,
      cover: this.#cover,
      genres: structuredClone(this.#genres),
    };
  }
}

module.exports = Track;
