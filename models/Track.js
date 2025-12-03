const tracksData = require('../data/tracks.json'); // change
const { createSearch } = require('../utils');

const TRACK_PRIVATE_SYMBOL = Symbol('TRACK_PRIVATE');

class Track {
    #id;
    #name;
    #artist;
    #album;
    #preview_url;
    #popularity;

    constructor(symbol, name, artist, album, preview_url, popularity) {
        if (symbol !== TRACK_PRIVATE_SYMBOL) {
            throw new Error('Track: use Track.create() instead of new Track()');
        }
        this.#id = new Date().getTime();
        this.#name = name;
        this.#artist = artist;
        this.#album = album;
        this.#preview_url = preview_url;
        this.#popularity = popularity;
    }

    static create(name, artist, album, preview_url, popularity = 0) {
        if (!name || !artist || !preview_url) {
            throw new Error('Track must have name, artist and preview_url fields');
        }

        if (!album) {
            album = name;
        }

        return new Track(name, artist, album, preview_url, popularity);
    }

    getId() { return this.#id; }
    getName() { return this.#name; }
    getArtist() { return this.#artist; }
    getAlbum() { return this.#album; }
    getPreviewUrl() { return this.#preview_url; }
    getPopularity() { return this.#popularity; }

    static validate(data) {
        const items = Array.isArray(data) ? data : [data];

        if (!items.every(item => item.name && item.artist && item.preview_url)) {
            throw new Error('Track must have name, artist and preview_url fields');
        }

        return true;
    }

    static search = createSearch(tracksData, ["name"]);

    toDTO() {
        return {
            id: this.id,
            name: this.name,
            artist: this.artist,
            album: this.album,
            preview_url: this.preview_url,
            popularity: this.popularity,
        };
    }
}

module.exports = Track;