const ARTIST_PRIVATE_SYMBOL = Symbol('ARTIST_PRIVATE');
const { getArtists } = require("../data/repositories/artistRepository");

class Artist {
    #id;
    #name;
    #picture_xl;
    #nb_fan;
    #type;
    #albumlist;

    constructor(symbol, name, picture_xl, nb_fan, type, albumlist) {
        if (symbol !== ARTIST_PRIVATE_SYMBOL) {
            throw new Error("Artist: use Artist.create() instead of new Artist()");
        }

        this.#id = new Date().getTime();
        this.#name = name;
        this.#picture_xl = picture_xl;
        this.#nb_fan = nb_fan;
        this.#type = type;
        this.#albumlist = [...albumlist];
    }

    static create(name, picture_xl, nb_fan, type, albumlist) {
        return new Artist(
            ARTIST_PRIVATE_SYMBOL,
            name,
            picture_xl,
            nb_fan,
            type,
            albumlist
        );
    }


    static async getPopularArtists(limit = 20) {
        const artists = await getArtists();
        const sorted = artists.sort((a, b) => b.nb_fan - a.nb_fan);
        return sorted.slice(0, limit);
      }

    static validate(data) {
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get picture_xl() {
        return this.#picture_xl;
    }

    get nb_fan() {
        return this.#nb_fan;
    }

    get type() {
        return this.#type;
    }

    get albumlist() {
        return [...this.#albumlist];
    }

    toDTO() {
        return {
            id: this.#id,
            name: this.#name,
            picture_xl: this.#picture_xl,
            nb_fan: this.#nb_fan,
            type: this.#type,
            albumlist: [...this.#albumlist]
        };
    }
}

module.exports = Artist;