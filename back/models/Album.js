const ALBUM_PRIVATE_SYMBOL = Symbol("ALBUM_PRIVATE");

class Album {
  #id;
  #title;
  #cover;
  #label;
  #fans;
  #release_date;
  #record_type;
  #genres;
  #artists;
  #nb_tracks;

  constructor(
    symbol,
    id,
    title,
    cover,
    label,
    fans,
    release_date,
    record_type,
    genres,
    artists,
    nb_tracks
  ) {
    if (symbol !== ALBUM_PRIVATE_SYMBOL) {
      throw new Error("Album: use Album.create() instead of new Album()");
    }

    this.#id = id;
    this.#title = title;
    this.#cover = cover;
    this.#label = label;
    this.#fans = fans;
    this.#release_date = release_date;
    this.#record_type = record_type;
    this.#genres = structuredClone(genres);
    this.#artists = structuredClone(artists);
    this.#nb_tracks = nb_tracks;
  }

  static create(
    id,
    title,
    cover,
    label,
    fans,
    release_date,
    record_type,
    genres,
    artists,
    nb_tracks
  ) {
    return new Album(
      ALBUM_PRIVATE_SYMBOL,
      id,
      title,
      cover,
      label,
      fans,
      release_date,
      record_type,
      genres,
      artists,
      nb_tracks
    );
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get cover() {
    return this.#cover;
  }

  get label() {
    return this.#label;
  }

  get fans() {
    return this.#fans;
  }

  get release_date() {
    return this.#release_date;
  }

  get record_type() {
    return this.#record_type;
  }

  get genres() {
    return structuredClone(this.#genres);
  }

  get artists() {
    return structuredClone(this.#artists);
  }

  get nb_tracks() {
    return this.#nb_tracks;
  }

  static validate(data) {}

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      cover: this.#cover,
      label: this.#label,
      fans: this.#fans,
      release_date: this.#release_date,
      record_type: this.#record_type,
      genres: structuredClone(this.#genres),
      artists: structuredClone(this.#artists),
      nb_tracks: this.#nb_tracks,
    };
  }
}

module.exports = Album;
