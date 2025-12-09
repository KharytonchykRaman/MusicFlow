const ALBUM_PRIVATE_SYMBOL = Symbol("ALBUM_PRIVATE");

class Album {
  #id;
  #title;
  #cover_xl;
  #label;
  #nb_tracks;
  #fans;
  #release_date;
  #record_type;
  #type;
  #genres;
  #contributors;
  #tracklist;

  constructor(
    symbol,
    title,
    cover_xl,
    label,
    nb_tracks,
    fans,
    release_date,
    record_type,
    type,
    genres,
    contributors,
    tracklist
  ) {
    if (symbol !== ALBUM_PRIVATE_SYMBOL) {
      throw new Error("Album: use Album.create() instead of new Album()");
    }

    this.#id = new Date().getTime();
    this.#title = title;
    this.#cover_xl = cover_xl;
    this.#label = label;
    this.#nb_tracks = nb_tracks;
    this.#fans = fans;
    this.#release_date = release_date;
    this.#record_type = record_type;
    this.#type = type;
    this.#genres = [...genres];
    this.#contributors = [...contributors];
    this.#tracklist = [...tracklist];
  }

  static create(
    title,
    cover_xl,
    label,
    nb_tracks,
    fans,
    release_date,
    record_type,
    type,
    genres,
    contributors,
    tracklist
  ) {
    return new Album(
      ALBUM_PRIVATE_SYMBOL,
      title,
      cover_xl,
      label,
      nb_tracks,
      fans,
      release_date,
      record_type,
      type,
      genres,
      contributors,
      tracklist
    );
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get cover_xl() {
    return this.#cover_xl;
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
    return [...this.#genres];
  }

  get contributors() {
    return [...this.#contributors];
  }

  get tracklist() {
    return [...this.#tracklist];
  }

  static validate(data) {}

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      cover_xl: this.#cover_xl,
      label: this.#label,
      nb_tracks: this.#nb_tracks,
      fans: this.#fans,
      release_date: this.#release_date,
      record_type: this.#record_type,
      type: this.#type,
      genres: [...this.#genres],
      contributors: [...this.#contributors],
      tracklist: [...this.#tracklist],
    };
  }
}

module.exports = Album;
