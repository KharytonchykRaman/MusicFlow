const fs = require("fs").promises;
const path = require("path");
const { Artist, Album, Track, Genre, syncDatabase } = require("../models");

async function importData() {
  try {
    const albumsData = JSON.parse(
      await fs.readFile(path.join(__dirname, "../data/albums.json"))
    );
    const tracksData = JSON.parse(
      await fs.readFile(path.join(__dirname, "../data/tracks.json"))
    );
    const artistsData = JSON.parse(
      await fs.readFile(path.join(__dirname, "../data/artists.json"))
    );

    const artistMap = new Map();
    const albumMap = new Map();

    for (const artist of artistsData) {
      const [newArtist, created] = await Artist.findOrCreate({
        where: { name: artist.name },
        defaults: {
          picture: artist.picture.trim(),
          fans: artist.fans,
        },
      });
      artistMap.set(artist.id, newArtist.id);
    }

    const genreSet = new Set();
    for (const track of tracksData) {
      for (const genre of track.genres) {
        genreSet.add(genre.name);
      }
    }
    for (const name of genreSet) {
      await Genre.findOrCreate({ where: { name } });
    }

    for (const album of albumsData) {
      const newAlbum = await Album.create({
        title: album.title,
        cover: album.cover.trim(),
        label: album.label || null,
        fans: album.fans,
        release_date: album.release_date,
        record_type: album.record_type,
        nb_tracks: album.nb_tracks,
      });
      albumMap.set(album.id, newAlbum.id);

      const artistIds = album.artists
        .map((a) => artistMap.get(a.id))
        .filter((id) => id);
      await newAlbum.setArtists(artistIds);
    }

    for (const track of tracksData) {
      const albumId = albumMap.get(track.albumId);

      const newTrack = await Track.create({
        title: track.title,
        rank: track.rank,
        preview: track.preview.trim(),
        track_position: track.track_position,
        cover: track.cover.trim(),
        albumId: albumId,
      });

      const allArtists = track.contributors;

      const newArtistIds = allArtists
        .map((a) => a.id)
        .map((id) => artistMap.get(id))
        .filter((id) => id);

      const uniqueNewArtistIds = [...new Set(newArtistIds)];

      await newTrack.setArtists(uniqueNewArtistIds);

      const genreNames = track.genres.map((g) => g.name);
      const genres = await Genre.findAll({ where: { name: genreNames } });
      const genreIds = genres.map((g) => g.id);
      await newTrack.setGenres(genreIds);
    }

    console.log("Success");
  } catch (error) {
    console.error("Error:", error);
  }
}

(async () => {
  await syncDatabase();
  await importData();
})();
