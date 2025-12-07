const https = require('https');
const fs = require('fs');

// === КОНФИГУРАЦИЯ ===
const ARTISTS_TO_FETCH = [
  'Eminem', 'Ed Sheeran', 'BTS', 'Taylor Swift', 'Drake', 'The Weeknd',
  'Adele', 'Coldplay', 'Rihanna', 'Justin Bieber', 'Billie Eilish',
  'Post Malone', 'Dua Lipa', 'Bruno Mars', 'Kendrick Lamar', 'Lady Gaga',
  'Imagine Dragons', 'Ariana Grande', 'Shakira', 'Metallica', 'AC/DC',
  'Nirvana', 'Linkin Park', 'Queen', 'The Beatles', 'Michael Jackson',
  'Jay-Z', 'Kanye West', 'Travis Scott', 'Bad Bunny', 'Lil Nas X', 'Juice Wrld', 
  'The Kid Laroi', 'Макс Корж', 'Heronwater', 'Zivert', 'Ваня Дмитриенко', 
  'Егор Крид', 'SALUKI', 'ЛСП', 'HammAli & Navai', 'Artik & Asti', 'ALBLAK 52',           
  'Кино', 'Дима Билан', 'Алла Пугачёва', 'FEDUK', 'Toxi$', 'Markul', 'JONY' 
]

const DELAY_MS = 125;

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function request(method, hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request({ method, hostname, path, headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${path}`));
        } else {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

// Упрощение данных
function simplifyArtist(artist) {
  return {
    id: artist.id.toString(),
    name: artist.name,
    picture_xl: artist.picture_xl
  };
}

function simplifyGenre(genre) {
  return {
    id: genre.id,
    name: genre.name
  };
}

// === ОСНОВНАЯ ЛОГИКА ===

async function fetchArtists() {
  console.log(`🔍 Ищем ${ARTISTS_TO_FETCH} популярных артистов...`);
  const artistIds = new Set();

  for (const name of ARTISTS_TO_FETCH) {
    try {
      const path = `/search/artist?q=${encodeURIComponent(name)}&limit=1`;
      const res = await request('GET', 'api.deezer.com', path);
      if (res.data && res.data.length > 0) {
        artistIds.add(res.data[0].id.toString());
        console.log(`  → Найден: ${res.data[0].name}`);
        await sleep(DELAY_MS);
      }
    } catch (e) {
      console.warn(`  ⚠️ Не удалось найти: ${name}`);
    }
  }

  return Array.from(artistIds).slice(0, 50);
}

// Функция для перемешивания массива (алгоритм Фишера–Йетса)
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Проверка: является ли одно название подстрокой другого
function isSubstringMatch(title1, title2) {
  const t1 = title1.trim().toLowerCase();
  const t2 = title2.trim().toLowerCase();
  return t1.includes(t2) || t2.includes(t1);
}

// Проверка уникальности по подстроке в списке
function isTitleUnique(newTitle, existingTitles) {
  return !existingTitles.some(existing => isSubstringMatch(newTitle, existing));
}

// === ОБРАБОТКА АРТИСТА ===
async function processArtist(artistId) {
  // 1. Основные данные артиста
  const artistRes = await request('GET', 'api.deezer.com', `/artist/${artistId}`);
  const artist = {
    id: artistRes.id.toString(),
    name: artistRes.name,
    picture_xl: artistRes.picture_xl,
    nb_fan: artistRes.nb_fan,
    type: 'artist'
  };
  await sleep(DELAY_MS);

  // 2. Получаем до 30 альбомов (включая синглы)
  const albumsRes = await request('GET', 'api.deezer.com', `/artist/${artistId}/albums?limit=30`);
  let albumItems = albumsRes.data || [];
  await sleep(DELAY_MS);

  // 3. Разделяем на альбомы и синглы
  const albums = albumItems.filter(item => item.record_type === 'album');
  const singles = albumItems.filter(item => item.record_type === 'single');

  // 4. Перемешиваем оба списка
  const shuffledAlbums = shuffleArray(albums);
  const shuffledSingles = shuffleArray(singles);

  // 5. Собираем уникальные альбомы и синглы
  const albumlist = [];
  const addedTitles = new Set(); // для отслеживания уникальности

  // Вспомогательная функция для добавления
  const tryAddItem = async (item) => {
    if (albumlist.length >= 10) return false; // максимум 10

    const newTitle = item.title;
    if (!isTitleUnique(newTitle, Array.from(addedTitles))) {
      return false; // дубликат
    }

    try {
      const albumRes = await request('GET', 'api.deezer.com', `/album/${item.id}`);
      const simplifiedAlbum = {
        id: albumRes.id.toString(),
        title: albumRes.title,
        cover_xl: albumRes.cover_xl,
        fans: albumRes.fans,
        release_date: albumRes.release_date,
        record_type: albumRes.record_type
      };
      albumlist.push(simplifiedAlbum);
      addedTitles.add(newTitle);
      await sleep(DELAY_MS);
      return true;
    } catch (e) {
      console.warn(`  ⚠️ Пропущен альбом ${item.id}`);
      return false;
    }
  };

  // 6. Добавляем сначала альбомы (до 5)
  let albumCount = 0;
  for (const item of shuffledAlbums) {
    if (albumCount >= 5) break;
    if (await tryAddItem(item)) albumCount++;
  }

  // 7. Добавляем синглы (до 5)
  let singleCount = 0;
  for (const item of shuffledSingles) {
    if (singleCount >= 5) break;
    if (await tryAddItem(item)) singleCount++;
  }

  artist.albumlist = albumlist;
  return artist;
}

// === ОБРАБОТКА АЛЬБОМА (для tracks.json и albums.json) ===
async function processAlbum(albumId) {
  // 1. Полные данные альбома
  const albumRes = await request('GET', 'api.deezer.com', `/album/${albumId}`);
  const album = {
    id: albumRes.id.toString(),
    title: albumRes.title,
    cover_xl: albumRes.cover_xl,
    label: albumRes.label,
    nb_tracks: albumRes.nb_tracks,
    fans: albumRes.fans,
    release_date: albumRes.release_date,
    record_type: albumRes.record_type,
    available: albumRes.available,
    type: 'album'
  };

  // genres
  if (albumRes.genres && albumRes.genres.data) {
    album.genres = {
      data: albumRes.genres.data.map(simplifyGenre)
    };
  }

  // contributors
  if (albumRes.contributors) {
    album.contributors = albumRes.contributors.map(simplifyArtist);
  }

  await sleep(DELAY_MS);

  // 2. Треки альбома (для tracklist)
  const tracksRes = await request('GET', 'api.deezer.com', `/album/${albumId}/tracks`);
  const tracklist = [];
  if (tracksRes.data) {
    for (const track of tracksRes.data) {
      tracklist.push({
        id: track.id.toString(),
        readable: track.readable,
        title: track.title,
        track_position: track.track_position,
        rank: track.rank,
        artist: {
          id: track.artist.id.toString(),
          name: track.artist.name
        }
      });
    }
  }
  album.tracklist = tracklist;
  await sleep(DELAY_MS);

  return album;
}

// === ОБРАБОТКА ТРЕКА ===
async function processTrack(trackId) {
  const trackRes = await request('GET', 'api.deezer.com', `/track/${trackId}`);
  const track = {
    id: trackRes.id.toString(),
    title: trackRes.title,
    rank: trackRes.rank,
    preview: trackRes.preview,
    type: 'track'
  };

  // contributors
  if (trackRes.contributors) {
    track.contributors = trackRes.contributors.map(simplifyArtist);
  }

  // artist
  if (trackRes.artist) {
    track.artist = simplifyArtist(trackRes.artist);
  }

  // album
  if (trackRes.album) {
    track.album = {
      id: trackRes.album.id.toString(),
      cover_xl: trackRes.album.cover_xl
    };
  }

  await sleep(DELAY_MS);
  return track;
}

// === ЗАПУСК ===
async function main() {
  try {
    const artistIds = await fetchArtists();
    console.log(`\n✅ Найдено ${artistIds.length} артистов.\n`);

    const artists = [];
    const albums = [];
    const tracks = [];
    const seenAlbums = new Set();
    const seenTracks = new Set();

    for (let i = 0; i < artistIds.length; i++) {
      const artistId = artistIds[i];
      console.log(`📥 Обработка артиста ${i + 1}/${artistIds.length}...`);

      try {
        // Артист с albumlist как массив
        const artist = await processArtist(artistId);
        artists.push(artist);

        // Альбомы
        for (const album of artist.albumlist) {
          if (seenAlbums.has(album.id)) continue;
          seenAlbums.add(album.id);

          try {
            // Получаем полный альбом (с tracklist как массив)
            const fullAlbum = await processAlbum(album.id);
            albums.push(fullAlbum);

            // Треки
            for (const track of fullAlbum.tracklist) {
              if (seenTracks.has(track.id)) continue;
              seenTracks.add(track.id);

              try {
                const fullTrack = await processTrack(track.id);
                tracks.push(fullTrack);
              } catch (e) {
                console.warn(`  ⚠️ Пропущен трек ${track.id}`);
              }
            }
          } catch (e) {
            console.warn(`  ⚠️ Пропущен альбом ${album.id}`);
          }
        }
      } catch (e) {
        console.warn(`  ⚠️ Пропущен артист ${artistId}`);
      }
    }

    // Сохраняем
    fs.writeFileSync('artists.json', JSON.stringify(artists, null, 2));
    fs.writeFileSync('albums.json', JSON.stringify(albums, null, 2));
    fs.writeFileSync('tracks.json', JSON.stringify(tracks, null, 2));

    console.log(`\n✅ Готово!`);
    console.log(`   Артисты: ${artists.length}`);
    console.log(`   Альбомы: ${albums.length}`);
    console.log(`   Треки: ${tracks.length}`);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

main();

// //Количество запросов в секунду ограничено 50 запросами / 5 секунд.

// Артисты: 50
// Альбомы: 249
// Треки: 1341

// // Artist 
// {
//   "id": "14456487",
//   "name": "Juice Wrld",
//   "picture_xl": "https://cdn-images.dzcdn.net/images/artist/924a4357edbf26fde6770e784196357c/1000x1000-000000-80-0-0.jpg",
//   "nb_fan": 2433496,
//   "albumlist": "https://api.deezer.com/artist/14456487/albums?limit=20",
//   "type": "artist"
// }

// // Artist's albums
// {
//   "data": [
//     {
//       "id": "676276191",
//       "title": "The Party Never Ends 2.0",
//       "cover_xl": "https://cdn-images.dzcdn.net/images/cover/b6f749a8957e3c59b66fc6a457aab28b/1000x1000-000000-80-0-0.jpg",
//       "fans": 5545,
//       "release_date": "2024-11-30",
//       "record_type": "album",
//     },
//   ]
// }

// // Album
// {
//   "id": "676276191",
//   "title": "The Party Never Ends 2.0",
//   "cover_xl": "https://cdn-images.dzcdn.net/images/cover/b6f749a8957e3c59b66fc6a457aab28b/1000x1000-000000-80-0-0.jpg",
//   "genres": {
//     "data": [
//       {
//         "id": 116,
//         "name": "Rap/Hip Hop",
//       }
//     ]
//   },
//   "label": "Grade A Productions/Interscope Records",
//   "nb_tracks": 19,
//   "fans": 5547,
//   "release_date": "2024-11-30",
//   "record_type": "album",
//   "available": true,
//   "tracklist": "https://api.deezer.com/album/676276191/tracks",
//   "contributors": [
//     {
//       "id": 14456487,
//       "name": "Juice Wrld",
//       "picture_xl": "https://cdn-images.dzcdn.net/images/artist/924a4357edbf26fde6770e784196357c/1000x1000-000000-80-0-0.jpg",
//     }
//   ],
//   "type": "album"
// }

// // Album's tracks
// {
//   "data": [
//     {
//       "id": "2587182192",
//       "readable": true,
//       "title": "Lace It",
//       "track_position": 1,
//       "rank": "449553",
//       "artist": {
//         "id": "14456487",
//         "name": "Juice Wrld",
//       }
//     }
//   ]
// }

// // Track
// {
//   "id": "2587182192",
//   "title": "Lace It",
//   "rank": "449553",
//   "preview": "https://cdnt-preview.dzcdn.net/api/1/1/4/4/4/0/444968763859184f82f7e6bdf8ca7900.mp3?hdnea=exp=1765033704~acl=/api/1/1/4/4/4/0/444968763859184f82f7e6bdf8ca7900.mp3*~data=user_id=0,application_id=42~hmac=3026ebb32dc545b8c1b4bd543dede39e3bb271930df5f8c1b2e9e68ea98a827e",
//   "contributors": [
//     {
//       "id": 14456487,
//       "name": "Juice Wrld",
//     },
//     {
//       "id": 13,
//       "name": "Eminem",
//     },
//     {
//       "id": 1547598,
//       "name": "Benny Blanco",
//     }
//   ],
//   "artist": {
//     "id": "14456487",
//     "name": "Juice Wrld",
//     "picture_xl": "https://cdn-images.dzcdn.net/images/artist/924a4357edbf26fde6770e784196357c/1000x1000-000000-80-0-0.jpg",
//   },
//   "album": {
//     "id": "524353312",
//     "cover_xl": "https://cdn-images.dzcdn.net/images/cover/8f73d483f3a1ff3c2f17ead1e59e7fa7/1000x1000-000000-80-0-0.jpg",
//   },
//   "type": "track"
// }