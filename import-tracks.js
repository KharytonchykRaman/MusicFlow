const https = require("https");
const fs = require("fs");

const ARTISTS_TO_FETCH = [
  "Eminem",
  "Ed Sheeran",
  "BTS",
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Adele",
  "Coldplay",
  "Rihanna",
  "Justin Bieber",
  "Billie Eilish",
  "Post Malone",
  "Dua Lipa",
  "Bruno Mars",
  "Kendrick Lamar",
  "Lady Gaga",
  "Imagine Dragons",
  "Ariana Grande",
  "Shakira",
  "Metallica",
  "AC/DC",
  "Nirvana",
  "Linkin Park",
  "Queen",
  "The Beatles",
  "Michael Jackson",
  "Jay-Z",
  "Kanye West",
  "Travis Scott",
  "Bad Bunny",
  "Lil Nas X",
  "Juice Wrld",
  "The Kid Laroi",
  "Макс Корж",
  "Heronwater",
  "Zivert",
  "Ваня Дмитриенко",
  "Егор Крид",
  "SALUKI",
  "ЛСП",
  "HammAli & Navai",
  "Artik & Asti",
  "ALBLAK 52",
  "Кино",
  "Дима Билан",
  "Алла Пугачёва",
  "FEDUK",
  "Toxi$",
  "Markul",
  "JONY",
];

// Количество запросов в секунду ограничено 50 запросами / 5 секунд.
const DELAY_MS = 110;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(method, hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { method, hostname, path, headers: { Accept: "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${path}`));
          } else {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function simplifyArtist(artist) {
  return {
    id: Number(artist.id),
    name: artist.name,
    picture: artist.picture_xl,
  };
}

function simplifyContributor(contributor) {
  return {
    id: Number(contributor.id),
    name: contributor.name,
  };
}

function simplifyGenre(genre) {
  return {
    id: genre.id,
    name: genre.name,
  };
}

async function fetchArtists() {
  const artistIds = [];

  for (const name of ARTISTS_TO_FETCH) {
    try {
      const path = `/search/artist?q=${encodeURIComponent(name)}&limit=1`;
      const res = await request("GET", "api.deezer.com", path);

      if (res.data && res.data.length > 0) {
        artistIds.push(Number(res.data[0].id));
        await sleep(DELAY_MS);
      }
    } catch (e) {
      console.warn(`Не удалось найти: ${name}`);
    }
  }

  return artistIds;
}

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isSubstringMatch(title1, title2) {
  const t1 = title1.toLowerCase();
  const t2 = title2.toLowerCase();
  return t1.includes(t2) || t2.includes(t1);
}

function isTitleUnique(newTitle, existingTitles) {
  return !existingTitles.some((existing) =>
    isSubstringMatch(newTitle, existing)
  );
}

async function processArtist(artistId) {
  const artistRes = await request(
    "GET",
    "api.deezer.com",
    `/artist/${artistId}`
  );

  const artist = {
    id: Number(artistRes.id),
    name: artistRes.name,
    picture: artistRes.picture_xl,
    fans: artistRes.nb_fan,
    type: "artist",
  };

  await sleep(DELAY_MS);

  const albumsRes = await request(
    "GET",
    "api.deezer.com",
    `/artist/${artistId}/albums?limit=40`
  );

  let albumItems = albumsRes.data;
  await sleep(DELAY_MS);

  const albums = albumItems.filter((item) => item.record_type === "album");
  const singles = albumItems.filter((item) => item.record_type === "single");

  const shuffledAlbums = shuffleArray(albums);
  const shuffledSingles = shuffleArray(singles);

  const albumlist = [];
  const addedTitles = new Set();

  const tryAddItem = (item) => {
    if (albumlist.length >= 10) return false;

    const newTitle = item.title;
    if (!isTitleUnique(newTitle, Array.from(addedTitles))) {
      return false;
    }

    const simplifiedAlbum = {
      id: Number(item.id),
      title: item.title,
      cover: item.cover_xl,
      fans: item.fans,
      release_date: item.release_date,
      record_type: item.record_type,
    };

    albumlist.push(simplifiedAlbum);
    addedTitles.add(newTitle);
    return true;
  };

  let albumCount = 0;
  for (const item of shuffledAlbums) {
    if (albumCount >= 3) break;
    if (tryAddItem(item)) albumCount++;
  }

  let singleCount = 0;
  for (const item of shuffledSingles) {
    if (singleCount >= 8) break;
    if (tryAddItem(item)) singleCount++;
  }

  artist.albumlist = albumlist;
  return artist;
}

async function processAlbum(albumId) {
  const albumRes = await request("GET", "api.deezer.com", `/album/${albumId}`);

  if (!albumRes.available) {
    return null;
  }

  const album = {
    id: Number(albumRes.id),
    title: albumRes.title,
    cover: albumRes.cover_xl,
    label: albumRes.label,
    fans: albumRes.fans,
    release_date: albumRes.release_date,
    record_type: albumRes.record_type,
    type: "album",
  };

  if (albumRes.genres && albumRes.genres.data) {
    album.genres = albumRes.genres.data.map(simplifyGenre);
  }

  if (albumRes.contributors) {
    album.artists = albumRes.contributors.map(simplifyArtist);
  }

  await sleep(DELAY_MS);

  const tracksRes = await request(
    "GET",
    "api.deezer.com",
    `/album/${albumId}/tracks`
  );
  const tracklist = [];
  if (tracksRes.data) {
    for (const track of tracksRes.data) {
      if (!track.readable) continue;

      tracklist.push({
        id: Number(track.id),
        title: track.title,
        track_position: track.track_position,
        rank: track.rank,
      });
    }
  }
  (album.nb_tracks = tracklist.length), (album.tracklist = tracklist);
  await sleep(DELAY_MS);

  return album;
}

async function processTrack(trackId) {
  const trackRes = await request("GET", "api.deezer.com", `/track/${trackId}`);
  const track = {
    id: Number(trackRes.id),
    title: trackRes.title,
    rank: trackRes.rank,
    preview: trackRes.preview,
    type: "track",
  };

  if (trackRes.contributors) {
    track.contributors = trackRes.contributors.map(simplifyContributor);
  }

  if (trackRes.artist) {
    track.artist = simplifyArtist(trackRes.artist);
  }

  if (trackRes.album) {
    track.album = {
      id: Number(trackRes.album.id),
      cover: trackRes.album.cover_xl,
    };
  }

  await sleep(DELAY_MS);
  return track;
}

async function main() {
  try {
    const artistIds = await fetchArtists();
    console.log(`\nНайдено ${artistIds.length} артистов.\n`);

    const artists = [];
    const albums = [];
    const tracks = [];
    const seenAlbums = new Set();
    const seenTracks = new Set();

    for (let i = 0; i < artistIds.length; i++) {
      const artistId = artistIds[i];
      console.log(`Обработка артиста ${i + 1}/${artistIds.length}...`);

      try {
        const artist = await processArtist(artistId);
        artists.push(artist);

        for (const album of artist.albumlist) {
          if (seenAlbums.has(album.id)) continue;
          seenAlbums.add(album.id);

          try {
            const fullAlbum = await processAlbum(album.id);

            if (!fullAlbum) continue;

            albums.push(fullAlbum);

            for (const track of fullAlbum.tracklist) {
              if (seenTracks.has(track.id)) continue;
              seenTracks.add(track.id);

              try {
                const fullTrack = await processTrack(track.id);
                tracks.push(fullTrack);
              } catch (e) {
                console.warn(`Пропущен трек ${track.id}`);
              }
            }
          } catch (e) {
            console.warn(`Пропущен альбом ${album.id}`);
          }
        }
      } catch (e) {
        console.warn(`Пропущен артист ${artistId}`);
      }
    }

    fs.writeFileSync("artists.json", JSON.stringify(artists, null, 2));
    fs.writeFileSync("albums.json", JSON.stringify(albums, null, 2));
    fs.writeFileSync("tracks.json", JSON.stringify(tracks, null, 2));

    console.log(`   Артисты: ${artists.length}`);
    console.log(`   Альбомы: ${albums.length}`);
    console.log(`   Треки: ${tracks.length}`);
  } catch (error) {
    console.error(error.message);
  }
}

main();
