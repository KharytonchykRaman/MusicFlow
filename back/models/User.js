const USER_PRIVATE_SYMBOL = Symbol("USER_PRIVATE");

class User {
  #id;
  #email;
  #username;
  #likedTrackIDs;
  #likedAlbumIDs;
  #followedArtistIDs;
  #likedPlaylistIDs;
  #createdPlaylistIDs;

  constructor(
    symbol,
    id,
    email,
    username,
    likedTrackIDs = [],
    likedAlbumIDs = [],
    followedArtistIDs = [],
    likedPlaylistIDs = [],
    createdPlaylistIDs = []
  ) {
    if (symbol !== USER_PRIVATE_SYMBOL) {
      throw new Error("User: use User.create() instead of new User()");
    }
    this.#id = id;
    this.#email = email;
    this.#username = username;
    this.#likedTrackIDs = [...likedTrackIDs];
    this.#likedAlbumIDs = [...likedAlbumIDs];
    this.#followedArtistIDs = [...followedArtistIDs];
    this.#likedPlaylistIDs = [...likedPlaylistIDs];
    this.#createdPlaylistIDs = [...createdPlaylistIDs];
  }

  static create(
    id,
    email,
    username,
    likedTrackIDs,
    likedAlbumIDs,
    followedArtistIDs,
    likedPlaylistIDs,
    createdPlaylistIDs
  ) {
    return new User(
      USER_PRIVATE_SYMBOL,
      id,
      email,
      username,
      likedTrackIDs,
      likedAlbumIDs,
      followedArtistIDs,
      likedPlaylistIDs,
      createdPlaylistIDs
    );
  }

  get id() {
    return this.#id;
  }
  get email() {
    return this.#email;
  }
  get username() {
    return this.#username;
  }

  get likedTrackIDs() {
    return [...this.#likedTrackIDs];
  }
  get likedAlbumIDs() {
    return [...this.#likedAlbumIDs];
  }
  get followedArtistIDs() {
    return [...this.#followedArtistIDs];
  }
  get likedPlaylistIDs() {
    return [...this.#likedPlaylistIDs];
  }
  get createdPlaylistIDs() {
    return [...this.#createdPlaylistIDs];
  }

  toDTO() {
    return {
      id: this.#id,
      email: this.#email,
      username: this.#username,
      likedTrackIDs: [...this.#likedTrackIDs],
      likedAlbumIDs: [...this.#likedAlbumIDs],
      followedArtistIDs: [...this.#followedArtistIDs],
      likedPlaylistIDs: [...this.#likedPlaylistIDs],
      createdPlaylistIDs: [...this.#createdPlaylistIDs],
    };
  }

  static validate(data) {}
}

module.exports = User;
