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
  #type;
  #tracklist;

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
    tracklist
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
    this.#type = "Playlist";
    this.#tracklist = structuredClone(tracklist);
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
    tracklist
  ) {
    return new Playlist(
      ALBUM_PRIVATE_SYMBOL,
      id,
      title,
      cover,
      label,
      userId,
      visibility,
      nb_tracks,
      fans,
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

  get type() {
    return this.#type;
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
      userId: this.#userId,
      visibility: this.#visibility,
      nb_tracks: this.#nb_tracks,
      fans: this.#fans,
      type: this.#type,
      tracklist: structuredClone(this.#tracklist),
    };
  }
}

module.exports = Playlist;
