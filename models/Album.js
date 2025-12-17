const ALBUM_PRIVATE_SYMBOL = Symbol("ALBUM_PRIVATE");

class Album {
  #id;
  #title;
  #cover;
  #label;
  #nb_tracks;
  #fans;
  #release_date;
  #record_type;
  #type;
  #genres;
  #artists;
  #tracklist;

  constructor(
    symbol,
    title,
    cover,
    label,
    nb_tracks,
    fans,
    release_date,
    record_type,
    type,
    genres,
    artists,
    tracklist
  ) {
    if (symbol !== ALBUM_PRIVATE_SYMBOL) {
      throw new Error("Album: use Album.create() instead of new Album()");
    }

    this.#id = new Date().getTime();
    this.#title = title;
    this.#cover = cover;
    this.#label = label;
    this.#nb_tracks = nb_tracks;
    this.#fans = fans;
    this.#release_date = release_date;
    this.#record_type = record_type;
    this.#type = type;
    this.#genres = structuredClone(genres);
    this.#artists = structuredClone(artists);
    this.#tracklist = structuredClone(tracklist);
  }

  static create(
    title,
    cover,
    label,
    nb_tracks,
    fans,
    release_date,
    record_type,
    type,
    genres,
    artists,
    tracklist
  ) {
    return new Album(
      ALBUM_PRIVATE_SYMBOL,
      title,
      cover,
      label,
      nb_tracks,
      fans,
      release_date,
      record_type,
      type,
      genres,
      artists,
      tracklist
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

  get nb_tracks() {
    return this.#nb_tracks;
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

  get type() {
    return this.#type;
  }

  get genres() {
    return structuredClone(this.#genres);
  }

  get artists() {
    return structuredClone(this.#artists);
  }

  get tracklist() {
    return structuredClone(this.#tracklist);
  }

  static validate(data) {}

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      cover: this.#cover,
      label: this.#label,
      nb_tracks: this.#nb_tracks,
      fans: this.#fans,
      release_date: this.#release_date,
      record_type: this.#record_type,
      type: this.#type,
      genres: structuredClone(this.#genres),
      artists: structuredClone(this.#artists),
      tracklist: structuredClone(this.#tracklist),
    };
  }
}

module.exports = Album;
