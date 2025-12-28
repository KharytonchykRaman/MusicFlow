const PLAYLIST_PRIVATE_SYMBOL = Symbol("PLAYLIST_PRIVATE");

class Playlist {
  #id;
  #title;
  #cover;
  #label;
  #userId;
  #visibility;
  #nb_tracks;
  #fans;
  #trackIds;

  constructor(
    symbol,
    id,
    title,
    cover,
    label,
    userId,
    visibility,
    nb_tracks,
    fans,
    trackIds
  ) {
    if (symbol !== PLAYLIST_PRIVATE_SYMBOL) {
      throw new Error(
        "Playlist: use Playlist.create() instead of new Playlist()"
      );
    }

    this.#id = id;
    this.#title = title;
    this.#cover = cover;
    this.#label = label;
    this.#userId = userId;
    this.#visibility = visibility;
    this.#nb_tracks = nb_tracks;
    this.#fans = fans;
    this.#trackIds = [...trackIds];
  }

  static create(
    id,
    title,
    cover,
    label,
    userId,
    visibility,
    nb_tracks,
    fans,
    trackIds
  ) {
    return new Playlist(
      PLAYLIST_PRIVATE_SYMBOL,
      id,
      title,
      cover,
      label,
      userId,
      visibility,
      nb_tracks,
      fans,
      trackIds
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

  get userId() {
    return this.#userId;
  }

  get visibility() {
    return this.#visibility;
  }

  get nb_tracks() {
    return this.#nb_tracks;
  }

  get fans() {
    return this.#fans;
  }

  get trackIds() {
    return [...this.#trackIds];
  }

  static validate(data) {}

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      cover: this.#cover,
      label: this.#label,
      userId: this.#userId,
      visibility: this.#visibility,
      nb_tracks: this.#nb_tracks,
      fans: this.#fans,
      trackIds: [...this.#trackIds],
    };
  }
}

module.exports = Playlist;
