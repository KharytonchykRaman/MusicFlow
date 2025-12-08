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
    this.#contributors = [...contributors];
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

  static validate(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return false;
    }

    if (typeof obj.title !== 'string') {
      return false;
    }

    if (!Number.isInteger(obj.rank) || obj.rank < 0) {
      return false;
    }

    if (typeof obj.preview !== 'string') {
      return false;
    }

    if (obj.type !== 'track') {
      return false;
    }

    if (!Array.isArray(obj.contributors)) {
      return false;
    }
    for (const contr of obj.contributors) {
      if (
        !contr ||
        typeof contr !== 'object' ||
        typeof contr.id !== 'string' ||
        typeof contr.name !== 'string'
      ) {
        return false;
      }
    }

    if (
      !obj.artist ||
      typeof obj.artist !== 'object' ||
      Array.isArray(obj.artist) ||
      typeof obj.artist.id !== 'string' ||
      typeof obj.artist.name !== 'string' ||
      typeof obj.artist.picture_xl !== 'string'
    ) {
      return false;
    }

    if (
      !obj.album ||
      typeof obj.album !== 'object' ||
      Array.isArray(obj.album) ||
      (typeof obj.album.id !== 'string' && typeof obj.album.id !== 'number') ||
      typeof obj.album.cover_xl !== 'string' ||
      obj.album.cover_xl.trim() === ''
    ) {
      return false;
    }

    // 9. Объект артиста должен быть внутри массива contributors
    const artistInContributors = obj.contributors.some(contr =>
      contr.id === obj.artist.id && contr.name === obj.artist.name
    );
    if (!artistInContributors) {
      return false;
    }

    // ✅ Все проверки пройдены
    return true;
  }

  getId() {
    return this.#id;
  }
  getTitle() {
    return this.#title;
  }
  getRank() {
    return this.#rank;
  }
  getPreview() {
    return this.#preview;
  }
  getType() {
    return this.#type;
  }
  getContributors() {
    return [...this.#contributors];
  }
  getArtist() {
    return { ...this.#artist };
  }
  getAlbum() {
    return { ...this.#album };
  }

  toDTO() {
    return {
      id: this.#id,
      title: this.#title,
      rank: this.#rank,
      preview: this.#preview,
      type: this.#type,
      contributors: [...this.#contributors],
      artist: { ...this.#artist },
      album: { ...this.#album },
    };
  }
}

module.exports = Track;
