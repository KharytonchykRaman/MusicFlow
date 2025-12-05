const https = require("https");
const fs = require("fs");
const querystring = require("querystring");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function searchTracks(query, limit = 10) {
  return new Promise((resolve, reject) => {
    const params = querystring.stringify({
      q: query,
      limit: limit,
    });

    const req = https.request(
      {
        hostname: "api.deezer.com",
        path: `/search?${params}`,
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "MusicApp-Coursework/1.0",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const response = JSON.parse(data);
            if (!response.data || !Array.isArray(response.data)) {
              return reject(new Error(`No tracks for: ${query}`));
            }

            const tracks = response.data.map((item) => ({
              id: item.id.toString(),
              name: item.title,
              artist: item.artist.name,
              album: item.album.title,
              preview_url: item.preview,
              duration_ms: item.duration * 1000,
              popularity: item.rank,
            }));

            resolve(tracks);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(10000);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`Timeout for: ${query}`));
    });
    req.end();
  });
}

// async function fetchTracks() {
//   try {
//     console.log("🔍 Запрос треков из Deezer API...");

//     // Рабочие запросы — по артистам и трекам
//     const queries = [
//       'artist:"Ed Sheeran"',
//       'artist:"The Weeknd"',
//       'artist:"Tones and I"',
//       'artist:"Radiohead"',
//       'artist:"Linkin Park"',
//       'track:"Shape of You"',
//       'track:"Blinding Lights"',
//       'track:"Dance Monkey"',
//     ];

//     let allTracks = [];

//     for (let i = 0; i < queries.length; i++) {
//       const query = queries[i];
//       console.log(`  → Запрос ${i + 1}/${queries.length}: ${query}`);

//       try {
//         const tracks = await searchTracks(query, 5);
//         allTracks.push(...tracks);
//         console.log(`    → Получено ${tracks.length} треков`);
//       } catch (e) {
//         console.warn(`    ⚠️ Пропущен: ${e.message}`);
//       }

//       if (i < queries.length - 1) {
//         await sleep(2000); // 2 секунды пауза
//       }
//     }

//     // Убираем дубликаты
//     const uniqueTracks = allTracks.filter(
//       (track, index, self) => index === self.findIndex((t) => t.id === track.id)
//     );

//     // Сортируем по популярности
//     uniqueTracks.sort((a, b) => b.popularity - a.popularity);

//     // Берём топ 100
//     const top100 = uniqueTracks.slice(0, 100);

//     // Сохраняем
//     fs.writeFileSync("data.json", JSON.stringify(top100, null, 2));
//     console.log(`\n✅ Успешно сохранено ${top100.length} треков в data.json`);
//     const withPreview = top100.filter((t) => t.preview_url).length;
//     console.log(
//       `🎧 Сниппеты доступны для ${withPreview} из ${top100.length} треков`
//     );
//   } catch (error) {
//     console.error("❌ Критическая ошибка:", error.message);
//   }
// }

const path = require("path");
const axios = require("axios");
const { URL } = require("url");

async function downloadResources(urls, outputDir = "./downloaded") {
  for (const link of urls) {
    try {
      const urlObj = new URL(link);
      const relativePath = urlObj.pathname.startsWith("/")
        ? urlObj.pathname.slice(1)
        : urlObj.pathname;
      const localPath = path.join(outputDir, relativePath);

      // Создаем директории, если их нет
      fs.mkdirSync(path.dirname(localPath), { recursive: true });

      console.log(`Скачиваю: ${link} -> ${localPath}`);

      const response = await axios.get(link, { responseType: "arraybuffer" });
      fs.writeFileSync(localPath, response.data);
    } catch (error) {
      console.error(`Ошибка при скачивании ${link}:`, error.message);
    }
  }
}

// (async () => {
//   await fetchTracks();
//   console.log("fetchTracks завершён");
// })().then(() => {
//   let tracks = JSON.parse(
//     fs.readFileSync(path.join(__dirname, "data.json"), "utf8")
//   );

//   // Пример использования:
//   const urls = tracks.map((tr) => tr.preview_url);

//   downloadResources(urls);
// });

// Унифицированная функция для запросов к Deezer API с повторами
function fetchDeezerEndpoint(endpoint, params = {}) {
  // endpoint — например: "/search", "/genre/132/tracks"
  // params — объект вроде { q: "популярная музыка", limit: 50 }

  const queryString = querystring.stringify(params);
  const fullPath = queryString ? `${endpoint}?${queryString}` : endpoint;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.deezer.com",
        path: fullPath,
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "MusicApp-Coursework/1.0",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(
              new Error(
                `Deezer API ${res.statusCode}: ${data || "no response"}`
              )
            );
          }
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error(`Invalid JSON: ${e.message}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(10000);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    req.end();
  });
}

// Приведение формата трека к единому виду
function normalizeTracks(rawTracks) {
  return rawTracks.map((item) => ({
    id: String(item.id),
    name: item.title || "Unknown",
    artist: item.artist?.name || "Unknown Artist",
    album: item.album?.title || "Unknown Album",
    preview_url: item.preview || null,
    duration_ms: (item.duration || 0) * 1000,
    popularity: item.rank || 0,
  }));
}

async function fetchTracks() {
  try {
    console.log("🔍 Сбор ~1000 популярных треков из разных жанров и языков...");

    let allTracks = [];

    // 1. Глобальный чарт (top tracks)
    console.log("→ Загрузка глобального чарта...");
    const chart = await fetchDeezerEndpoint("/chart/0/tracks", { limit: 100 });
    if (chart && Array.isArray(chart.data)) {
      allTracks.push(...normalizeTracks(chart.data));
      console.log(
        `  → Получено ${chart.data.length} треков из глобального чарта`
      );
    }

    // 2. Популярные жанры (ID из Deezer)
    // https://api.deezer.com/genre
    const genreIds = [
      132, // Pop
      116, // Rock
      113, // Hip Hop
      106, // Electro
      152, // Indie
      113, // Rap (часто совпадает с Hip Hop)
      85, // Alternative
      466, // R&B
      16, // Русская поп-музыка (часто используется для русскоязычного контента)
      98, // Soul & Funk
      144, // Metal
    ];

    for (const genreId of genreIds) {
      console.log(`→ Загрузка треков из жанра ID ${genreId}...`);
      try {
        const result = await fetchDeezerEndpoint(`/genre/${genreId}/tracks`, {
          limit: 80,
        });
        if (result && Array.isArray(result.data)) {
          allTracks.push(...normalizeTracks(result.data));
          console.log(`  → Получено ${result.data.length} треков`);
        } else {
          console.warn(`  ⚠️ Жанр ${genreId}: нет данных`);
        }
      } catch (e) {
        console.warn(`  ⚠️ Ошибка жанра ${genreId}: ${e.message}`);
      }
      await sleep(1500);
    }

    // 3. Поисковые запросы на русском и английском
    // 3. Языковые поисковые запросы — ТЕПЕРЬ КОРРЕКТНО
    const searchQueries = [
      // English
      "popular hits",
      "new music 2025",
      "top tracks",
      "best songs",
      "viral songs",
      "chart hits",
      "trending now",
      // Russian
      "популярная музыка",
      "новинки музыки 2025",
      "русские хиты",
      "лучшие песни",
      "топ треки",
      "русский чарт",
    ];

    for (const query of searchQueries) {
      console.log(`→ Поиск: ${query}`);
      try {
        const result = await fetchDeezerEndpoint("/search", {
          q: query,
          limit: 60,
        });
        if (result && Array.isArray(result.data)) {
          allTracks.push(...normalizeTracks(result.data));
          console.log(`  → Получено ${result.data.length} треков`);
        } else {
          console.warn(`  ⚠️ Нет данных для запроса: ${query}`);
        }
      } catch (e) {
        console.warn(`  ⚠️ Ошибка поиска "${query}": ${e.message}`);
      }
      await sleep(2000);
    }

    // Убираем дубликаты
    const uniqueTracks = allTracks.filter(
      (track, index, self) => index === self.findIndex((t) => t.id === track.id)
    );

    // Сортируем по популярности (rank в Deezer)
    uniqueTracks.sort((a, b) => b.popularity - a.popularity);

    // Берём до 1000
    const top1000 = uniqueTracks.slice(0, 1000);

    // Сохраняем
    fs.writeFileSync("data.json", JSON.stringify(top1000, null, 2));
    const withPreview = top1000.filter((t) => t.preview_url).length;
    console.log(`\n✅ Успешно сохранено ${top1000.length} треков в data.json`);
    console.log(
      `🎧 Сниппеты доступны для ${withPreview} из ${top1000.length} треков`
    );
  } catch (error) {
    console.error("❌ Критическая ошибка в fetchTracks:", error.message);
  }
}

fetchTracks();

/*
https://e-cdns-images.dzcdn.net/images/cover/{md5_image}/{size}.jpg
https://e-cdns-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500.jpg

https://developers.deezer.com/api/explorer

Количество запросов в секунду ограничено 50 запросами / 5 секунд.

Optionnal Parameters (for all methods) : 
strict - Disable the fuzzy mode (?strict=on)
order - Possible values : RANKING, TRACK_ASC, TRACK_DESC, 
ARTIST_ASC, ARTIST_DESC, ALBUM_ASC, ALBUM_DESC, 
RATING_ASC, RATING_DESC, DURATION_ASC, DURATION_DESC

Advanced search

artist	
The artist name	
string	
https://api.deezer.com/search?q=artist:"aloe blacc"

album	
The album's title	
string	
https://api.deezer.com/search?q=album:"good things"

track	
The track's title	
string	
https://api.deezer.com/search?q=track:"i need a dollar"

label	
The label name	
string	
https://api.deezer.com/search?q=label:"because music"

dur_min	
The track's minimum duration in seconds	
int	
https://api.deezer.com/search?q=dur_min:300

dur_max	
The track's maximum duration in seconds	
int	
https://api.deezer.com/search?q=dur_max:500

bpm_min	
The track's minimum bpm	
int	
https://api.deezer.com/search?q=bpm_min:120

bpm_max	
The track's maximum bpm	
int	
https://api.deezer.com/search?q=bpm_max:200

You can also mixed your search, by adding a space between each field, to be more specific.
Examples
https://api.deezer.com/search?q=artist:"aloe blacc" track:"i need a dollar"
https://api.deezer.com/search?q=bpm_min:120 dur_min:300
*/

// Track
// {
//   "id": "3135556",
//   "title": "Harder, Better, Faster, Stronger",
//   "track_position": 4,
//   "rank": "808208",
//   "readable": true,
//   "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/a/2/0/6a2c0a5670afe821e08fc5154909534a.mp3?hdnea=exp=1764957136~acl=/api/1/1/6/a/2/0/6a2c0a5670afe821e08fc5154909534a.mp3*~data=user_id=0,application_id=42~hmac=0ffc755ed6358c8792100b6425dc6b4740da50c6dfc650f96c30145159e71855",
//   "contributors": [
//     {
//       "id": 27,
//       "name": "Daft Punk",
//       "picture": "https://api.deezer.com/artist/27/image",
//       "type": "artist",
//     }
//   ],
//   "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
//   "album": {
//     "id": "302127",
//     "title": "Discovery",
//     "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
//     "release_date": "2001-03-07",
//     "type": "album"
//   },
//   "type": "track"
// }

// Artist 
// {
//   "id": "27",
//   "name": "Daft Punk",
//   "picture": "https://api.deezer.com/artist/27/image",
//   "nb_fan": 5054705,
//   "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
//   "type": "artist"
// }
// artist / top	Get the top 5 tracks of an artist	A list of object of type track
// artist / albums	Return a list of artist's albums. Represented by an array of Album objects	A list of object of type album
// artist / fans	Return a list of artist's fans. Represented by an array of User objects	A list of object of type user
// artist / related	Return a list of related artists. Represented by an array of Artist objects	A list of object of type artist
// artist / radio	Return a list of tracks. Represented by an array of Track object	A list of object of type track
// artist / playlists	Return a list of artist's playlists. Represented by an array of Playlist object	A list of object of type playlist

// Album
{
  "id": "302127",
  "title": "Discovery",
  "upc": "724384960650",
  "cover": "https://api.deezer.com/album/302127/image",
  "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
  "genre_id": 113,
  "genres": {
    "data": [
      {
        "id": 113,
        "name": "Dance",
        "picture": "https://api.deezer.com/genre/113/image",
        "type": "genre"
      }
    ]
  },
  "label": "Daft Life Ltd./ADA France",
  "nb_tracks": 14,
  "fans": 320374,
  "release_date": "2001-03-07",
  "record_type": "album",
  "available": true,
  "tracklist": "https://api.deezer.com/album/302127/tracks",
  "contributors": [
    {
      "id": 27,
      "name": "Daft Punk",
      "link": "https://www.deezer.com/artist/27",
      "share": "https://www.deezer.com/artist/27?utm_source=deezer&utm_content=artist-27&utm_term=0_1764978499&utm_medium=web",
      "picture": "https://api.deezer.com/artist/27/image",
      "picture_small": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/56x56-000000-80-0-0.jpg",
      "picture_medium": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/250x250-000000-80-0-0.jpg",
      "picture_big": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/500x500-000000-80-0-0.jpg",
      "picture_xl": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/1000x1000-000000-80-0-0.jpg",
      "radio": true,
      "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
      "type": "artist",
      "role": "Main"
    }
  ],
  "artist": {
    "id": "27",
    "name": "Daft Punk",
    "picture": "https://api.deezer.com/artist/27/image",
    "picture_small": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/56x56-000000-80-0-0.jpg",
    "picture_medium": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/250x250-000000-80-0-0.jpg",
    "picture_big": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/500x500-000000-80-0-0.jpg",
    "picture_xl": "https://cdn-images.dzcdn.net/images/artist/638e69b9caaf9f9f3f8826febea7b543/1000x1000-000000-80-0-0.jpg",
    "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
    "type": "artist"
  },
  "type": "album",
  "tracks": {
    "data": [
      {
        "id": "3135553",
        "readable": true,
        "title": "One More Time",
        "title_short": "One More Time",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135553",
        "duration": "320",
        "rank": "888570",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3?hdnea=exp=1764979399~acl=/api/1/1/f/8/c/0/f8c5dc3837912dba37c9a1ab3170cc3f.mp3*~data=user_id=0,application_id=42~hmac=a82431a4c9966d1c42b6cd5ca129a8513d70309aa9bd6cf2c29193e282e7cc12",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135554",
        "readable": true,
        "title": "Aerodynamic",
        "title_short": "Aerodynamic",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135554",
        "duration": "212",
        "rank": "737732",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/9/9/0/699d41611cf0280f0a55c8ba4a372c14.mp3?hdnea=exp=1764979399~acl=/api/1/1/6/9/9/0/699d41611cf0280f0a55c8ba4a372c14.mp3*~data=user_id=0,application_id=42~hmac=dd1475927fdb76be6eeb8f056a1471e4876b1fe96157584813a8144b781cc9e3",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135555",
        "readable": true,
        "title": "Digital Love",
        "title_short": "Digital Love",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135555",
        "duration": "301",
        "rank": "741182",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/1/e/c/0/1ec8ff31f93acc81ebb93a45c191e219.mp3?hdnea=exp=1764979399~acl=/api/1/1/1/e/c/0/1ec8ff31f93acc81ebb93a45c191e219.mp3*~data=user_id=0,application_id=42~hmac=e8ed40798f3f2de86523549789286fbb4f497b4a05c5d4506d691c73b24b4011",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135556",
        "readable": true,
        "title": "Harder, Better, Faster, Stronger",
        "title_short": "Harder, Better, Faster, Stronger",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135556",
        "duration": "226",
        "rank": "808208",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/a/2/0/6a2c0a5670afe821e08fc5154909534a.mp3?hdnea=exp=1764979399~acl=/api/1/1/6/a/2/0/6a2c0a5670afe821e08fc5154909534a.mp3*~data=user_id=0,application_id=42~hmac=50b29b2545491a0ba9fdd76b216bd4f42e5fd74ef4918dc2329060ad65586c7a",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135557",
        "readable": true,
        "title": "Crescendolls",
        "title_short": "Crescendolls",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135557",
        "duration": "211",
        "rank": "598856",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/1/f/6/0/1f65f58dc3cfa276ac6a1ee6f2ffac20.mp3?hdnea=exp=1764979399~acl=/api/1/1/1/f/6/0/1f65f58dc3cfa276ac6a1ee6f2ffac20.mp3*~data=user_id=0,application_id=42~hmac=15f2f4542886d5f6f9e8b1beb85c60986438328f2b90b830252903100943dc82",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135558",
        "readable": true,
        "title": "Nightvision",
        "title_short": "Nightvision",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135558",
        "duration": "104",
        "rank": "545716",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/c/0/6/0/c063dbb3b8f2af8dac3e88950f2e38b0.mp3?hdnea=exp=1764979399~acl=/api/1/1/c/0/6/0/c063dbb3b8f2af8dac3e88950f2e38b0.mp3*~data=user_id=0,application_id=42~hmac=1a26a8341db9edc335b40274a064d2350a54c4d017493051f0b0b5b21accaefa",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135559",
        "readable": true,
        "title": "Superheroes",
        "title_short": "Superheroes",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135559",
        "duration": "237",
        "rank": "641309",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/1/b/c/0/1bc57c07bfaf6a265e06ce9574390e0e.mp3?hdnea=exp=1764979399~acl=/api/1/1/1/b/c/0/1bc57c07bfaf6a265e06ce9574390e0e.mp3*~data=user_id=0,application_id=42~hmac=adb06e8ee9f6cf116bf81f9f24bb2f003d438298080ca22776939c93247eee73",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135560",
        "readable": true,
        "title": "High Life",
        "title_short": "High Life",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135560",
        "duration": "201",
        "rank": "600156",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/e/e/a/0/eea4fd9467e697d503998dff44ceeaa3.mp3?hdnea=exp=1764979399~acl=/api/1/1/e/e/a/0/eea4fd9467e697d503998dff44ceeaa3.mp3*~data=user_id=0,application_id=42~hmac=0f14553c70fcf8bfff94e92dd2b105e642ad96f83965eb48cc187d6cb36b079f",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135561",
        "readable": true,
        "title": "Something About Us",
        "title_short": "Something About Us",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135561",
        "duration": "232",
        "rank": "764640",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/c/f/f/0/cff7c95e11ba9f6ac3ff0401a81df4f5.mp3?hdnea=exp=1764979399~acl=/api/1/1/c/f/f/0/cff7c95e11ba9f6ac3ff0401a81df4f5.mp3*~data=user_id=0,application_id=42~hmac=d9778148c4a37fe805026f6dd2f1d38cc69da3619a509cf39b4f42e6cee6454e",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135562",
        "readable": true,
        "title": "Voyager",
        "title_short": "Voyager",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135562",
        "duration": "227",
        "rank": "735740",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/b/c/9/0/bc95bc4a6fdcf3e9b1672229f679eea1.mp3?hdnea=exp=1764979399~acl=/api/1/1/b/c/9/0/bc95bc4a6fdcf3e9b1672229f679eea1.mp3*~data=user_id=0,application_id=42~hmac=abb73799d02a7d55a29a65b72d64fc9cb3fdb0e6cec2df60123e3553adb7a25a",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135563",
        "readable": true,
        "title": "Veridis Quo",
        "title_short": "Veridis Quo",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135563",
        "duration": "345",
        "rank": "928445",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/4/5/0/6456b666c0b1d4537e34d71e5cbd098c.mp3?hdnea=exp=1764979399~acl=/api/1/1/6/4/5/0/6456b666c0b1d4537e34d71e5cbd098c.mp3*~data=user_id=0,application_id=42~hmac=81b2dab6fa0d8bf2f8b9115e8e036f5b2b99df8d45573a6a77a0eec75b053692",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135564",
        "readable": true,
        "title": "Short Circuit",
        "title_short": "Short Circuit",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135564",
        "duration": "206",
        "rank": "516356",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/4/1/3/0/413592fd246163564e5416fb72f8c831.mp3?hdnea=exp=1764979399~acl=/api/1/1/4/1/3/0/413592fd246163564e5416fb72f8c831.mp3*~data=user_id=0,application_id=42~hmac=8f355a994d8dfba16073dd35352284c15a3455a05d07d7b29aff21854f9386a4",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135565",
        "readable": true,
        "title": "Face to Face",
        "title_short": "Face to Face",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135565",
        "duration": "240",
        "rank": "662878",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/b/c/5/0/bc5ffa003d9ccf020a633083738c6ae4.mp3?hdnea=exp=1764979399~acl=/api/1/1/b/c/5/0/bc5ffa003d9ccf020a633083738c6ae4.mp3*~data=user_id=0,application_id=42~hmac=8979c818400c0e91cf95d8e949f98583d7d46bf2c4e3e14c1d212cb39dc918ab",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3135566",
        "readable": true,
        "title": "Too Long",
        "title_short": "Too Long",
        "title_version": "",
        "link": "https://www.deezer.com/track/3135566",
        "duration": "600",
        "rank": "579059",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/8/f/e/0/8fe6827c48cc62fb82fe8e741b0534f4.mp3?hdnea=exp=1764979399~acl=/api/1/1/8/f/e/0/8fe6827c48cc62fb82fe8e741b0534f4.mp3*~data=user_id=0,application_id=42~hmac=3b85986593100a361a13cd519c8bcb5fa9d5db1d37622badf99f7cfb7764656c",
        "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
        "artist": {
          "id": "27",
          "name": "Daft Punk",
          "tracklist": "https://api.deezer.com/artist/27/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "302127",
          "title": "Discovery",
          "cover": "https://api.deezer.com/album/302127/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5718f7c81c27e0b2417e2a4c45224f8a",
          "tracklist": "https://api.deezer.com/album/302127/tracks",
          "type": "album"
        },
        "type": "track"
      }
    ]
  }
}

album / fans	Return a list of album's fans. Represented by an array of User objects	A list of object of type user
album / tracks	Return a list of album's tracks. Represented by an array of Track objects	A list of object of type track

// Playlist
{
  "id": "908622995",
  "title": "En mode 60",
  "description": "Les meilleurs hits des années 60 sont dans cette playlist.",
  "duration": 9002,
  "public": true,
  "is_loved_track": false,
  "collaborative": false,
  "nb_tracks": 50,
  "fans": 20259,
  "link": "https://www.deezer.com/playlist/908622995",
  "share": "https://www.deezer.com/playlist/908622995?utm_source=deezer&utm_content=playlist-908622995&utm_term=0_1764978768&utm_medium=web",
  "picture": "https://api.deezer.com/playlist/908622995/image",
  "picture_small": "https://cdn-images.dzcdn.net/images/playlist/4fd375a41c7779ed7deab64fb1194099/56x56-000000-80-0-0.jpg",
  "picture_medium": "https://cdn-images.dzcdn.net/images/playlist/4fd375a41c7779ed7deab64fb1194099/250x250-000000-80-0-0.jpg",
  "picture_big": "https://cdn-images.dzcdn.net/images/playlist/4fd375a41c7779ed7deab64fb1194099/500x500-000000-80-0-0.jpg",
  "picture_xl": "https://cdn-images.dzcdn.net/images/playlist/4fd375a41c7779ed7deab64fb1194099/1000x1000-000000-80-0-0.jpg",
  "checksum": "eadc7113a8d041ea25a7d9cd13d0dca3",
  "tracklist": "https://api.deezer.com/playlist/908622995/tracks",
  "creation_date": "2014-06-27 11:09:31",
  "add_date": "2023-12-21 10:30:38",
  "mod_date": "2025-11-01 04:01:25",
  "md5_image": "4fd375a41c7779ed7deab64fb1194099",
  "picture_type": "playlist",
  "creator": {
    "id": "1687950",
    "name": "Alexandre - Pop & Hits Editor",
    "tracklist": "https://api.deezer.com/user/1687950/flow",
    "type": "user"
  },
  "type": "playlist",
  "tracks": {
    "data": [
      {
        "id": "366450991",
        "readable": true,
        "title": "Nights In White Satin",
        "title_short": "Nights In White Satin",
        "title_version": "",
        "isrc": "GBA176700080",
        "link": "https://www.deezer.com/track/366450991",
        "duration": "265",
        "rank": "807022",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/3/8/3/0/3838f7c599f4bf115dd60f91208799d9.mp3?hdnea=exp=1764979668~acl=/api/1/1/3/8/3/0/3838f7c599f4bf115dd60f91208799d9.mp3*~data=user_id=0,application_id=42~hmac=ddca20267c2610bf5534eb9cbe87bf703943dbb3416d5bde7a5c12bec4bdc35e",
        "md5_image": "ab19dfe1340d810a1146a16f5230b3c6",
        "time_add": 1703151038,
        "artist": {
          "id": "4212",
          "name": "The Moody Blues",
          "link": "https://www.deezer.com/artist/4212",
          "tracklist": "https://api.deezer.com/artist/4212/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "42219371",
          "title": "Nights In White Satin",
          "upc": "602557635829",
          "cover": "https://api.deezer.com/album/42219371/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/ab19dfe1340d810a1146a16f5230b3c6/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/ab19dfe1340d810a1146a16f5230b3c6/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/ab19dfe1340d810a1146a16f5230b3c6/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/ab19dfe1340d810a1146a16f5230b3c6/1000x1000-000000-80-0-0.jpg",
          "md5_image": "ab19dfe1340d810a1146a16f5230b3c6",
          "tracklist": "https://api.deezer.com/album/42219371/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "136710424",
        "readable": true,
        "title": "Stand By Me",
        "title_short": "Stand By Me",
        "title_version": "",
        "isrc": "USAT21205862",
        "link": "https://www.deezer.com/track/136710424",
        "duration": "174",
        "rank": "891401",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/5/3/c/0/53c52c53d5d3afa3d5aca46eee9badb1.mp3?hdnea=exp=1764979668~acl=/api/1/1/5/3/c/0/53c52c53d5d3afa3d5aca46eee9badb1.mp3*~data=user_id=0,application_id=42~hmac=5b73fa8d97031dec7b813da685536b6b4dcc1406dc6836da6ef797365066b721",
        "md5_image": "efe117f19e86acfddfb8d047f2d1ab06",
        "time_add": 1703151038,
        "artist": {
          "id": "227",
          "name": "Ben E. King",
          "link": "https://www.deezer.com/artist/227",
          "tracklist": "https://api.deezer.com/artist/227/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "14632126",
          "title": "Stand By Me",
          "upc": "084247952537",
          "cover": "https://api.deezer.com/album/14632126/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/efe117f19e86acfddfb8d047f2d1ab06/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/efe117f19e86acfddfb8d047f2d1ab06/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/efe117f19e86acfddfb8d047f2d1ab06/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/efe117f19e86acfddfb8d047f2d1ab06/1000x1000-000000-80-0-0.jpg",
          "md5_image": "efe117f19e86acfddfb8d047f2d1ab06",
          "tracklist": "https://api.deezer.com/album/14632126/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "561690",
        "readable": true,
        "title": "Siffler sur la colline",
        "title_short": "Siffler sur la colline",
        "title_version": "",
        "isrc": "FRZ086900080",
        "link": "https://www.deezer.com/track/561690",
        "duration": "156",
        "rank": "839974",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/7/e/2/0/7e2aacfe59e8e8403c8fc8398504e57a.mp3?hdnea=exp=1764979668~acl=/api/1/1/7/e/2/0/7e2aacfe59e8e8403c8fc8398504e57a.mp3*~data=user_id=0,application_id=42~hmac=758e3bedbba665e5f607d70fa82183a5a2c186ee94635e8583245b5be742c2ca",
        "md5_image": "97672f0531b1e9f65473ae20eeab84b6",
        "time_add": 1703151038,
        "artist": {
          "id": "2636",
          "name": "Joe Dassin",
          "link": "https://www.deezer.com/artist/2636",
          "tracklist": "https://api.deezer.com/artist/2636/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "73273",
          "title": "Joe Dassin Éternel...",
          "upc": "5099752049127",
          "cover": "https://api.deezer.com/album/73273/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/97672f0531b1e9f65473ae20eeab84b6/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/97672f0531b1e9f65473ae20eeab84b6/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/97672f0531b1e9f65473ae20eeab84b6/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/97672f0531b1e9f65473ae20eeab84b6/1000x1000-000000-80-0-0.jpg",
          "md5_image": "97672f0531b1e9f65473ae20eeab84b6",
          "tracklist": "https://api.deezer.com/album/73273/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "885544",
        "readable": true,
        "title": "Unchained Melody",
        "title_short": "Unchained Melody",
        "title_version": "",
        "isrc": "USPG16590023",
        "link": "https://www.deezer.com/track/885544",
        "duration": "214",
        "rank": "762981",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/9/6/0/69660980e35faa9143757580f4345b80.mp3?hdnea=exp=1764979668~acl=/api/1/1/6/9/6/0/69660980e35faa9143757580f4345b80.mp3*~data=user_id=0,application_id=42~hmac=ab92bbfb8f2f87f0498f75182d074b9868af6872ad41eb0d52988c5e498d1533",
        "md5_image": "341d2ff6e18789314303cb2073b8f9fb",
        "time_add": 1703151038,
        "artist": {
          "id": "5852",
          "name": "The Righteous Brothers",
          "link": "https://www.deezer.com/artist/5852",
          "tracklist": "https://api.deezer.com/artist/5852/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "100471",
          "title": "The Collection",
          "upc": "731454417525",
          "cover": "https://api.deezer.com/album/100471/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/341d2ff6e18789314303cb2073b8f9fb/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/341d2ff6e18789314303cb2073b8f9fb/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/341d2ff6e18789314303cb2073b8f9fb/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/341d2ff6e18789314303cb2073b8f9fb/1000x1000-000000-80-0-0.jpg",
          "md5_image": "341d2ff6e18789314303cb2073b8f9fb",
          "tracklist": "https://api.deezer.com/album/100471/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "116348632",
        "readable": true,
        "title": "Hey Jude (Remastered 2015)",
        "title_short": "Hey Jude",
        "title_version": "(Remastered 2015)",
        "isrc": "GBUM71505902",
        "link": "https://www.deezer.com/track/116348632",
        "duration": "429",
        "rank": "870104",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/b/e/3/0/be3c33e5b05a25dc63b8951748615d74.mp3?hdnea=exp=1764979668~acl=/api/1/1/b/e/3/0/be3c33e5b05a25dc63b8951748615d74.mp3*~data=user_id=0,application_id=42~hmac=684bbe6810877986995a6de0c66f5b646d587f8cc08f4e0e5a35e0ede2300379",
        "md5_image": "c65b3bd84e81056e060be144381c06c8",
        "time_add": 1703151038,
        "artist": {
          "id": "1",
          "name": "The Beatles",
          "link": "https://www.deezer.com/artist/1",
          "tracklist": "https://api.deezer.com/artist/1/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "12047956",
          "title": "1 (Remastered)",
          "upc": "602547673503",
          "cover": "https://api.deezer.com/album/12047956/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/c65b3bd84e81056e060be144381c06c8/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/c65b3bd84e81056e060be144381c06c8/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/c65b3bd84e81056e060be144381c06c8/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/c65b3bd84e81056e060be144381c06c8/1000x1000-000000-80-0-0.jpg",
          "md5_image": "c65b3bd84e81056e060be144381c06c8",
          "tracklist": "https://api.deezer.com/album/12047956/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "92551068",
        "readable": true,
        "title": "What a Wonderful World (Remastered)",
        "title_short": "What a Wonderful World",
        "title_version": "(Remastered)",
        "isrc": "ES6601404373",
        "link": "https://www.deezer.com/track/92551068",
        "duration": "140",
        "rank": "508517",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/d/2/e/0/d2e998a675dd794d58546297eef1951e.mp3?hdnea=exp=1764979668~acl=/api/1/1/d/2/e/0/d2e998a675dd794d58546297eef1951e.mp3*~data=user_id=0,application_id=42~hmac=933f41eba77ddc5f1d60740c1546bf25aec549ff9f52779083b3d871ca63b4f8",
        "md5_image": "9e92eafc4763ff46daa2e17b6df33717",
        "time_add": 1703151038,
        "artist": {
          "id": "2337",
          "name": "Louis Armstrong",
          "link": "https://www.deezer.com/artist/2337",
          "tracklist": "https://api.deezer.com/artist/2337/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "9392704",
          "title": "Georgia on My Mind (Remastered)",
          "upc": "8433391178164",
          "cover": "https://api.deezer.com/album/9392704/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/9e92eafc4763ff46daa2e17b6df33717/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/9e92eafc4763ff46daa2e17b6df33717/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/9e92eafc4763ff46daa2e17b6df33717/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/9e92eafc4763ff46daa2e17b6df33717/1000x1000-000000-80-0-0.jpg",
          "md5_image": "9e92eafc4763ff46daa2e17b6df33717",
          "tracklist": "https://api.deezer.com/album/9392704/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "141165331",
        "readable": true,
        "title": "Aline",
        "title_short": "Aline",
        "title_version": "",
        "isrc": "FR45F6500020",
        "link": "https://www.deezer.com/track/141165331",
        "duration": "169",
        "rank": "846548",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/c/6/3/0/c635a55b2466580c2381941a5482fa5b.mp3?hdnea=exp=1764979668~acl=/api/1/1/c/6/3/0/c635a55b2466580c2381941a5482fa5b.mp3*~data=user_id=0,application_id=42~hmac=8b0d51dbfbfcfe94d0a227e593b032f8d85b10441b9bdbc1e1466f23771d873d",
        "md5_image": "fb63bb6d8bb238dacd70148f8a13881f",
        "time_add": 1703151038,
        "artist": {
          "id": "1627",
          "name": "Christophe",
          "link": "https://www.deezer.com/artist/1627",
          "tracklist": "https://api.deezer.com/artist/1627/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "15228373",
          "title": "Aline",
          "upc": "886443867338",
          "cover": "https://api.deezer.com/album/15228373/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/fb63bb6d8bb238dacd70148f8a13881f/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/fb63bb6d8bb238dacd70148f8a13881f/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/fb63bb6d8bb238dacd70148f8a13881f/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/fb63bb6d8bb238dacd70148f8a13881f/1000x1000-000000-80-0-0.jpg",
          "md5_image": "fb63bb6d8bb238dacd70148f8a13881f",
          "tracklist": "https://api.deezer.com/album/15228373/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "2321278",
        "readable": true,
        "title": "California Dreamin' (Single Version)",
        "title_short": "California Dreamin'",
        "title_version": "(Single Version)",
        "isrc": "USMC16532697",
        "link": "https://www.deezer.com/track/2321278",
        "duration": "160",
        "rank": "935739",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/9/8/9/0/9895315baa4c7f21041f7045c35c6262.mp3?hdnea=exp=1764979668~acl=/api/1/1/9/8/9/0/9895315baa4c7f21041f7045c35c6262.mp3*~data=user_id=0,application_id=42~hmac=0de5d6e7f1574a0cc87c1f509769010d9e946b4c50f6a380dc3887a97c91b4e3",
        "md5_image": "dfa9363d1ff6372e0e321dbc9da46ec9",
        "time_add": 1703151038,
        "artist": {
          "id": "539",
          "name": "The Mamas & The Papas",
          "link": "https://www.deezer.com/artist/539",
          "tracklist": "https://api.deezer.com/artist/539/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "231182",
          "title": "If You Can Believe Your Eyes & Ears",
          "upc": "008811173920",
          "cover": "https://api.deezer.com/album/231182/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/dfa9363d1ff6372e0e321dbc9da46ec9/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/dfa9363d1ff6372e0e321dbc9da46ec9/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/dfa9363d1ff6372e0e321dbc9da46ec9/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/dfa9363d1ff6372e0e321dbc9da46ec9/1000x1000-000000-80-0-0.jpg",
          "md5_image": "dfa9363d1ff6372e0e321dbc9da46ec9",
          "tracklist": "https://api.deezer.com/album/231182/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "2133626",
        "readable": true,
        "title": "I Say a Little Prayer",
        "title_short": "I Say a Little Prayer",
        "title_version": "",
        "isrc": "USAT29902236",
        "link": "https://www.deezer.com/track/2133626",
        "duration": "212",
        "rank": "876274",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/6/1/0/661c6f34db98c426e812659347bf4e9c.mp3?hdnea=exp=1764979668~acl=/api/1/1/6/6/1/0/661c6f34db98c426e812659347bf4e9c.mp3*~data=user_id=0,application_id=42~hmac=7948f4853e9ba21841c6356232c011a83e026d4a723259256df80702720b0812",
        "md5_image": "23982d11bffa050597a3243e373f7a1b",
        "time_add": 1703151038,
        "artist": {
          "id": "2059",
          "name": "Aretha Franklin",
          "link": "https://www.deezer.com/artist/2059",
          "tracklist": "https://api.deezer.com/artist/2059/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "213969",
          "title": "Soul Queen",
          "upc": "603497987856",
          "cover": "https://api.deezer.com/album/213969/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/23982d11bffa050597a3243e373f7a1b/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/23982d11bffa050597a3243e373f7a1b/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/23982d11bffa050597a3243e373f7a1b/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/23982d11bffa050597a3243e373f7a1b/1000x1000-000000-80-0-0.jpg",
          "md5_image": "23982d11bffa050597a3243e373f7a1b",
          "tracklist": "https://api.deezer.com/album/213969/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1175777",
        "readable": true,
        "title": "Sunny",
        "title_short": "Sunny",
        "title_version": "",
        "isrc": "USPR39402093",
        "link": "https://www.deezer.com/track/1175777",
        "duration": "167",
        "rank": "766340",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/6/8/0/6681b09b78e916402d51d27098a52926.mp3?hdnea=exp=1764979668~acl=/api/1/1/6/6/8/0/6681b09b78e916402d51d27098a52926.mp3*~data=user_id=0,application_id=42~hmac=b6f8bc3de83246996dd1b98f3aeeaba286297a4bcd72bc9f6410080152119524",
        "md5_image": "ec31046ae953238177ef63f0bcb77e17",
        "time_add": 1703151038,
        "artist": {
          "id": "6191",
          "name": "Bobby Hebb",
          "link": "https://www.deezer.com/artist/6191",
          "tracklist": "https://api.deezer.com/artist/6191/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "125719",
          "title": "Sunny",
          "upc": "731454654326",
          "cover": "https://api.deezer.com/album/125719/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/ec31046ae953238177ef63f0bcb77e17/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/ec31046ae953238177ef63f0bcb77e17/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/ec31046ae953238177ef63f0bcb77e17/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/ec31046ae953238177ef63f0bcb77e17/1000x1000-000000-80-0-0.jpg",
          "md5_image": "ec31046ae953238177ef63f0bcb77e17",
          "tracklist": "https://api.deezer.com/album/125719/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1150880",
        "readable": true,
        "title": "Love Me, Please Love Me",
        "title_short": "Love Me, Please Love Me",
        "title_version": "",
        "isrc": "GBBBY0400036",
        "link": "https://www.deezer.com/track/1150880",
        "duration": "260",
        "rank": "749407",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/5/3/8/0/5382957167fb57faaa65fe39790f5967.mp3?hdnea=exp=1764979668~acl=/api/1/1/5/3/8/0/5382957167fb57faaa65fe39790f5967.mp3*~data=user_id=0,application_id=42~hmac=6d5a73d6176c0f5bfde2fb8d993af324d2579520319ec753ade218eaba0259de",
        "md5_image": "40c841e93cdf64f89a4a6d8eb8aa107c",
        "time_add": 1703151038,
        "artist": {
          "id": "1803",
          "name": "Michel Polnareff",
          "link": "https://www.deezer.com/artist/1803",
          "tracklist": "https://api.deezer.com/artist/1803/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "123317",
          "title": "Love Me Please Love Me",
          "upc": "602478415326",
          "cover": "https://api.deezer.com/album/123317/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/40c841e93cdf64f89a4a6d8eb8aa107c/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/40c841e93cdf64f89a4a6d8eb8aa107c/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/40c841e93cdf64f89a4a6d8eb8aa107c/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/40c841e93cdf64f89a4a6d8eb8aa107c/1000x1000-000000-80-0-0.jpg",
          "md5_image": "40c841e93cdf64f89a4a6d8eb8aa107c",
          "tracklist": "https://api.deezer.com/album/123317/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "7677778",
        "readable": true,
        "title": "(I Can't Get No) Satisfaction (Mono)",
        "title_short": "(I Can't Get No) Satisfaction",
        "title_version": "(Mono)",
        "isrc": "USA176510160",
        "link": "https://www.deezer.com/track/7677778",
        "duration": "224",
        "rank": "790376",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/5/b/0/0/5b0d89432364d33427368ef35f344eff.mp3?hdnea=exp=1764979668~acl=/api/1/1/5/b/0/0/5b0d89432364d33427368ef35f344eff.mp3*~data=user_id=0,application_id=42~hmac=70b37bd8557dc062c6bb860bd3beb9ac5fffa56225e31c15cca57698ec663a07",
        "md5_image": "0d3be6936cd5a5e81db72f04ed75e4fb",
        "time_add": 1703151038,
        "artist": {
          "id": "11",
          "name": "The Rolling Stones",
          "link": "https://www.deezer.com/artist/11",
          "tracklist": "https://api.deezer.com/artist/11/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "708965",
          "title": "Singles 1965-1967",
          "upc": "018771122029",
          "cover": "https://api.deezer.com/album/708965/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/0d3be6936cd5a5e81db72f04ed75e4fb/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/0d3be6936cd5a5e81db72f04ed75e4fb/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/0d3be6936cd5a5e81db72f04ed75e4fb/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/0d3be6936cd5a5e81db72f04ed75e4fb/1000x1000-000000-80-0-0.jpg",
          "md5_image": "0d3be6936cd5a5e81db72f04ed75e4fb",
          "tracklist": "https://api.deezer.com/album/708965/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "71323824",
        "readable": true,
        "title": "These Boots Are Made for Walkin'",
        "title_short": "These Boots Are Made for Walkin'",
        "title_version": "",
        "isrc": "USASE0710284",
        "link": "https://www.deezer.com/track/71323824",
        "duration": "163",
        "rank": "784246",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/a/6/9/0/a692e3d4973d7f456535f65f3d7f8995.mp3?hdnea=exp=1764979668~acl=/api/1/1/a/6/9/0/a692e3d4973d7f456535f65f3d7f8995.mp3*~data=user_id=0,application_id=42~hmac=4007723ee09c026efb87bd3683622a183c669ecf42dda154670535996c23b773",
        "md5_image": "5c3242cc98cf23a2f434d229c29a4fc6",
        "time_add": 1738377385,
        "artist": {
          "id": "1032",
          "name": "Nancy Sinatra",
          "link": "https://www.deezer.com/artist/1032",
          "tracklist": "https://api.deezer.com/artist/1032/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "7002727",
          "title": "Kid Stuff",
          "upc": "888003335905",
          "cover": "https://api.deezer.com/album/7002727/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/5c3242cc98cf23a2f434d229c29a4fc6/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/5c3242cc98cf23a2f434d229c29a4fc6/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/5c3242cc98cf23a2f434d229c29a4fc6/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/5c3242cc98cf23a2f434d229c29a4fc6/1000x1000-000000-80-0-0.jpg",
          "md5_image": "5c3242cc98cf23a2f434d229c29a4fc6",
          "tracklist": "https://api.deezer.com/album/7002727/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "64638141",
        "readable": true,
        "title": "Let's Twist Again",
        "title_short": "Let's Twist Again",
        "title_version": "",
        "isrc": "USI4R0502238",
        "link": "https://www.deezer.com/track/64638141",
        "duration": "143",
        "rank": "617714",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 3,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/3/e/e/0/3ee326ae1457c5fefd43a969c0e1d6d1.mp3?hdnea=exp=1764979668~acl=/api/1/1/3/e/e/0/3ee326ae1457c5fefd43a969c0e1d6d1.mp3*~data=user_id=0,application_id=42~hmac=abc88c22ddc4923abdf9b4556661226e251709e93b65adf082388acce47ccbc8",
        "md5_image": "b2bc48aaded398362e4d667cb4488ad7",
        "time_add": 1757127188,
        "artist": {
          "id": "2202",
          "name": "Chubby Checker",
          "link": "https://www.deezer.com/artist/2202",
          "tracklist": "https://api.deezer.com/artist/2202/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "6332442",
          "title": "Chubby Checker Classics",
          "upc": "887396986763",
          "cover": "https://api.deezer.com/album/6332442/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/b2bc48aaded398362e4d667cb4488ad7/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/b2bc48aaded398362e4d667cb4488ad7/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/b2bc48aaded398362e4d667cb4488ad7/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/b2bc48aaded398362e4d667cb4488ad7/1000x1000-000000-80-0-0.jpg",
          "md5_image": "b2bc48aaded398362e4d667cb4488ad7",
          "tracklist": "https://api.deezer.com/album/6332442/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3484535",
        "readable": true,
        "title": "Le lion est mort ce soir",
        "title_short": "Le lion est mort ce soir",
        "title_version": "",
        "isrc": "FRZ116203270",
        "link": "https://www.deezer.com/track/3484535",
        "duration": "165",
        "rank": "580685",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/5/c/3/0/5c35bd6e62959832a697430092d15eac.mp3?hdnea=exp=1764979668~acl=/api/1/1/5/c/3/0/5c35bd6e62959832a697430092d15eac.mp3*~data=user_id=0,application_id=42~hmac=4718bc0fc711c792e228525bdbf5bfaa808054c82560eec6583ae9bc0fa34292",
        "md5_image": "b8aed1e6214479e0d2d05653532f5de6",
        "time_add": 1754103188,
        "artist": {
          "id": "5953",
          "name": "Henri Salvador",
          "link": "https://www.deezer.com/artist/5953",
          "tracklist": "https://api.deezer.com/artist/5953/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "330251",
          "title": "Triple Best Of",
          "upc": "5099969645655",
          "cover": "https://api.deezer.com/album/330251/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/b8aed1e6214479e0d2d05653532f5de6/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/b8aed1e6214479e0d2d05653532f5de6/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/b8aed1e6214479e0d2d05653532f5de6/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/b8aed1e6214479e0d2d05653532f5de6/1000x1000-000000-80-0-0.jpg",
          "md5_image": "b8aed1e6214479e0d2d05653532f5de6",
          "tracklist": "https://api.deezer.com/album/330251/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1505294852",
        "readable": true,
        "title": "Le Temps De L'amour",
        "title_short": "Le Temps De L'amour",
        "title_version": "",
        "isrc": "GBBXS2036773",
        "link": "https://www.deezer.com/track/1505294852",
        "duration": "140",
        "rank": "463015",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 2,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/2/e/8/0/2e81e7a70a5f74e58b5a2bc62b9b3877.mp3?hdnea=exp=1764979668~acl=/api/1/1/2/e/8/0/2e81e7a70a5f74e58b5a2bc62b9b3877.mp3*~data=user_id=0,application_id=42~hmac=cf42a79d90ca2e002922d2d278d0d07359767b923dad158466e78effd4177094",
        "md5_image": "75eaac58e12916075622b963839673fd",
        "time_add": 1754103188,
        "artist": {
          "id": "4676",
          "name": "Françoise Hardy",
          "link": "https://www.deezer.com/artist/4676",
          "tracklist": "https://api.deezer.com/artist/4676/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "261552302",
          "title": "l'idole Des Jeunes",
          "upc": "9358782135078",
          "cover": "https://api.deezer.com/album/261552302/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/75eaac58e12916075622b963839673fd/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/75eaac58e12916075622b963839673fd/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/75eaac58e12916075622b963839673fd/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/75eaac58e12916075622b963839673fd/1000x1000-000000-80-0-0.jpg",
          "md5_image": "75eaac58e12916075622b963839673fd",
          "tracklist": "https://api.deezer.com/album/261552302/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "358680521",
        "readable": true,
        "title": "Green Onions",
        "title_short": "Green Onions",
        "title_version": "",
        "isrc": "USAT20000736",
        "link": "https://www.deezer.com/track/358680521",
        "duration": "174",
        "rank": "672309",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/2/d/3/0/2d3b5eb263246fc85474a710bb5fe187.mp3?hdnea=exp=1764979668~acl=/api/1/1/2/d/3/0/2d3b5eb263246fc85474a710bb5fe187.mp3*~data=user_id=0,application_id=42~hmac=265d9ff143262dade740e415f15fb7043c72762a0ffc8b49544841a1ca51d984",
        "md5_image": "0200687500c6be43ceb9aca484677b3a",
        "time_add": 1759546869,
        "artist": {
          "id": "13566",
          "name": "Booker T. & the M.G.'s",
          "link": "https://www.deezer.com/artist/13566",
          "tracklist": "https://api.deezer.com/artist/13566/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "41236131",
          "title": "Stax Classics",
          "upc": "603497869756",
          "cover": "https://api.deezer.com/album/41236131/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/0200687500c6be43ceb9aca484677b3a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/0200687500c6be43ceb9aca484677b3a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/0200687500c6be43ceb9aca484677b3a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/0200687500c6be43ceb9aca484677b3a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "0200687500c6be43ceb9aca484677b3a",
          "tracklist": "https://api.deezer.com/album/41236131/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "2628773",
        "readable": true,
        "title": "Mirza",
        "title_short": "Mirza",
        "title_version": "",
        "isrc": "FRZ016601070",
        "link": "https://www.deezer.com/track/2628773",
        "duration": "146",
        "rank": "580703",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/0/f/6/0/0f645f9230014369fd8fa1bd3dedcb5a.mp3?hdnea=exp=1764979668~acl=/api/1/1/0/f/6/0/0f645f9230014369fd8fa1bd3dedcb5a.mp3*~data=user_id=0,application_id=42~hmac=44e8577c6d984d8afa293dd54350ddc8153899735faf3cf95f30e02204bbd350",
        "md5_image": "0be242d7aab897e7192f1445a8281057",
        "time_add": 1761966085,
        "artist": {
          "id": "447",
          "name": "Nino Ferrer",
          "link": "https://www.deezer.com/artist/447",
          "tracklist": "https://api.deezer.com/artist/447/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "255728",
          "title": "Nino Ferrer",
          "upc": "602498212561",
          "cover": "https://api.deezer.com/album/255728/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/0be242d7aab897e7192f1445a8281057/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/0be242d7aab897e7192f1445a8281057/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/0be242d7aab897e7192f1445a8281057/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/0be242d7aab897e7192f1445a8281057/1000x1000-000000-80-0-0.jpg",
          "md5_image": "0be242d7aab897e7192f1445a8281057",
          "tracklist": "https://api.deezer.com/album/255728/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3413187",
        "readable": true,
        "title": "La bohème",
        "title_short": "La bohème",
        "title_version": "",
        "isrc": "FRZ116500180",
        "link": "https://www.deezer.com/track/3413187",
        "duration": "243",
        "rank": "940092",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/7/8/9/0/789cc7c1f18beaae4b33f9098d2c7459.mp3?hdnea=exp=1764979668~acl=/api/1/1/7/8/9/0/789cc7c1f18beaae4b33f9098d2c7459.mp3*~data=user_id=0,application_id=42~hmac=e902868a50bafaf91d8f1984136e3da47cc5ddbe353138e9cadd5dd9ab14dce8",
        "md5_image": "4a745ed02e6678ab0e1f85ad45f3d701",
        "time_add": 1703151038,
        "artist": {
          "id": "1001",
          "name": "Charles Aznavour",
          "link": "https://www.deezer.com/artist/1001",
          "tracklist": "https://api.deezer.com/artist/1001/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "324222",
          "title": "La Bohème",
          "upc": "724383496853",
          "cover": "https://api.deezer.com/album/324222/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/4a745ed02e6678ab0e1f85ad45f3d701/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/4a745ed02e6678ab0e1f85ad45f3d701/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/4a745ed02e6678ab0e1f85ad45f3d701/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/4a745ed02e6678ab0e1f85ad45f3d701/1000x1000-000000-80-0-0.jpg",
          "md5_image": "4a745ed02e6678ab0e1f85ad45f3d701",
          "tracklist": "https://api.deezer.com/album/324222/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1093255",
        "readable": true,
        "title": "The Letter",
        "title_short": "The Letter",
        "title_version": "",
        "isrc": "USAR17200009",
        "link": "https://www.deezer.com/track/1093255",
        "duration": "112",
        "rank": "690958",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/9/9/d/0/99dde19ce95e29217683e614a462db4d.mp3?hdnea=exp=1764979668~acl=/api/1/1/9/9/d/0/99dde19ce95e29217683e614a462db4d.mp3*~data=user_id=0,application_id=42~hmac=c91e88025f3d57f3cb9eec38743a0637ae9006b500f0964995377c5ab61055c2",
        "md5_image": "4121c91bc7df364427704ecf400652f1",
        "time_add": 1751684233,
        "artist": {
          "id": "267057392",
          "name": "The Box Tops",
          "link": "https://www.deezer.com/artist/267057392",
          "tracklist": "https://api.deezer.com/artist/267057392/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "118025",
          "title": "The Letter/Neon Rainbow",
          "upc": "888880313003",
          "cover": "https://api.deezer.com/album/118025/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/4121c91bc7df364427704ecf400652f1/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/4121c91bc7df364427704ecf400652f1/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/4121c91bc7df364427704ecf400652f1/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/4121c91bc7df364427704ecf400652f1/1000x1000-000000-80-0-0.jpg",
          "md5_image": "4121c91bc7df364427704ecf400652f1",
          "tracklist": "https://api.deezer.com/album/118025/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "687923",
        "readable": true,
        "title": "Hold On, I'm Comin'",
        "title_short": "Hold On, I'm Comin'",
        "title_version": "",
        "isrc": "USAT20001059",
        "link": "https://www.deezer.com/track/687923",
        "duration": "149",
        "rank": "640240",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/2/d/e/0/2dee55a1161ebaafbeaaca3433af27d2.mp3?hdnea=exp=1764979668~acl=/api/1/1/2/d/e/0/2dee55a1161ebaafbeaaca3433af27d2.mp3*~data=user_id=0,application_id=42~hmac=7701fa0c2db25aed88d7b2836bb91ff5d67184dbc6b6c11eff2b8ea8de402bce",
        "md5_image": "fa713a57d76f38ce226cec614678893e",
        "time_add": 1759546869,
        "artist": {
          "id": "62360",
          "name": "Sam & Dave",
          "link": "https://www.deezer.com/artist/62360",
          "tracklist": "https://api.deezer.com/artist/62360/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "82967",
          "title": "The Best of Sam & Dave",
          "upc": "603497984763",
          "cover": "https://api.deezer.com/album/82967/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/fa713a57d76f38ce226cec614678893e/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/fa713a57d76f38ce226cec614678893e/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/fa713a57d76f38ce226cec614678893e/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/fa713a57d76f38ce226cec614678893e/1000x1000-000000-80-0-0.jpg",
          "md5_image": "fa713a57d76f38ce226cec614678893e",
          "tracklist": "https://api.deezer.com/album/82967/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "116348252",
        "readable": true,
        "title": "Drive My Car (Remastered 2009)",
        "title_short": "Drive My Car",
        "title_version": "(Remastered 2009)",
        "isrc": "GBAYE0601479",
        "link": "https://www.deezer.com/track/116348252",
        "duration": "148",
        "rank": "635618",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/5/0/3/0/503bffe29874005a81949b744569d646.mp3?hdnea=exp=1764979668~acl=/api/1/1/5/0/3/0/503bffe29874005a81949b744569d646.mp3*~data=user_id=0,application_id=42~hmac=58c8c53f6dd22b1d0c3c5e82dddcacca9f7b55b9c7bab6c57e99d10a8eaa61af",
        "md5_image": "da80520440d5d29876b9df3e375793b5",
        "time_add": 1740796802,
        "artist": {
          "id": "1",
          "name": "The Beatles",
          "link": "https://www.deezer.com/artist/1",
          "tracklist": "https://api.deezer.com/artist/1/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "12047936",
          "title": "Rubber Soul (Remastered 2009)",
          "upc": "602547670151",
          "cover": "https://api.deezer.com/album/12047936/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/da80520440d5d29876b9df3e375793b5/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/da80520440d5d29876b9df3e375793b5/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/da80520440d5d29876b9df3e375793b5/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/da80520440d5d29876b9df3e375793b5/1000x1000-000000-80-0-0.jpg",
          "md5_image": "da80520440d5d29876b9df3e375793b5",
          "tracklist": "https://api.deezer.com/album/12047936/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "729585752",
        "readable": true,
        "title": "Do You Love Me (Mono Single)",
        "title_short": "Do You Love Me",
        "title_version": "(Mono Single)",
        "isrc": "USMO16200263",
        "link": "https://www.deezer.com/track/729585752",
        "duration": "173",
        "rank": "421967",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/e/a/c/0/eac28d9185b7e7aaa3503792c0efc48e.mp3?hdnea=exp=1764979668~acl=/api/1/1/e/a/c/0/eac28d9185b7e7aaa3503792c0efc48e.mp3*~data=user_id=0,application_id=42~hmac=3c13ff6c5c3845eba0c077d94c338a5658cf80d21b8b76ab1e680de1ebed6d22",
        "md5_image": "d7a8e6e67f8e02d96787a508e23c9db3",
        "time_add": 1749264380,
        "artist": {
          "id": "13885",
          "name": "The Contours",
          "link": "https://www.deezer.com/artist/13885",
          "tracklist": "https://api.deezer.com/artist/13885/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "107079892",
          "title": "Motown Greatest Hits",
          "upc": "600753879689",
          "cover": "https://api.deezer.com/album/107079892/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/d7a8e6e67f8e02d96787a508e23c9db3/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/d7a8e6e67f8e02d96787a508e23c9db3/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/d7a8e6e67f8e02d96787a508e23c9db3/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/d7a8e6e67f8e02d96787a508e23c9db3/1000x1000-000000-80-0-0.jpg",
          "md5_image": "d7a8e6e67f8e02d96787a508e23c9db3",
          "tracklist": "https://api.deezer.com/album/107079892/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3155135",
        "readable": true,
        "title": "House of the Rising Sun",
        "title_short": "House of the Rising Sun",
        "title_version": "",
        "isrc": "GBAYE6400209",
        "link": "https://www.deezer.com/track/3155135",
        "duration": "269",
        "rank": "929515",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/9/b/7/0/9b7e92687ac045ff790aa51844997efc.mp3?hdnea=exp=1764979668~acl=/api/1/1/9/b/7/0/9b7e92687ac045ff790aa51844997efc.mp3*~data=user_id=0,application_id=42~hmac=7a69b6ffbdc05ee5d0a30b85ebc1b2f67c1ebdf4dba3d01845494b5d7487df1e",
        "md5_image": "fcfd5b42f95e8e1e87e717a64b8d2fdb",
        "time_add": 1757127188,
        "artist": {
          "id": "3350",
          "name": "The Animals",
          "link": "https://www.deezer.com/artist/3350",
          "tracklist": "https://api.deezer.com/artist/3350/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "303394",
          "title": "The Best of the Animals",
          "upc": "724352708451",
          "cover": "https://api.deezer.com/album/303394/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/fcfd5b42f95e8e1e87e717a64b8d2fdb/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/fcfd5b42f95e8e1e87e717a64b8d2fdb/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/fcfd5b42f95e8e1e87e717a64b8d2fdb/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/fcfd5b42f95e8e1e87e717a64b8d2fdb/1000x1000-000000-80-0-0.jpg",
          "md5_image": "fcfd5b42f95e8e1e87e717a64b8d2fdb",
          "tracklist": "https://api.deezer.com/album/303394/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "71483071",
        "readable": true,
        "title": "Somethin' Stupid (2008 Remastered)",
        "title_short": "Somethin' Stupid",
        "title_version": "(2008 Remastered)",
        "isrc": "USRH10723033",
        "link": "https://www.deezer.com/track/71483071",
        "duration": "159",
        "rank": "767903",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/2/9/b/0/29b2f8f6df6345feb3d230447bbdefbc.mp3?hdnea=exp=1764979668~acl=/api/1/1/2/9/b/0/29b2f8f6df6345feb3d230447bbdefbc.mp3*~data=user_id=0,application_id=42~hmac=df3429cf09f22ef93996b3346291f46b235639240083666d512e1e5bb20f528c",
        "md5_image": "621c706e3416c6c52671ab7fe11878f6",
        "time_add": 1761966085,
        "artist": {
          "id": "617",
          "name": "Frank Sinatra",
          "link": "https://www.deezer.com/artist/617",
          "tracklist": "https://api.deezer.com/artist/617/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "7021224",
          "title": "Nothing But The Best (2008 Remastered)",
          "upc": "602537596379",
          "cover": "https://api.deezer.com/album/7021224/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/621c706e3416c6c52671ab7fe11878f6/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/621c706e3416c6c52671ab7fe11878f6/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/621c706e3416c6c52671ab7fe11878f6/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/621c706e3416c6c52671ab7fe11878f6/1000x1000-000000-80-0-0.jpg",
          "md5_image": "621c706e3416c6c52671ab7fe11878f6",
          "tracklist": "https://api.deezer.com/album/7021224/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "64550206",
        "readable": true,
        "title": "Non, Je ne regrette rien",
        "title_short": "Non, Je ne regrette rien",
        "title_version": "",
        "isrc": "USCHR1377609",
        "link": "https://www.deezer.com/track/64550206",
        "duration": "140",
        "rank": "638426",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/a/a/7/0/aa700aaabd98d36ac74f824839dd6945.mp3?hdnea=exp=1764979668~acl=/api/1/1/a/a/7/0/aa700aaabd98d36ac74f824839dd6945.mp3*~data=user_id=0,application_id=42~hmac=2b542fa572670a6be6988b25f98a7b3cfb1c88402c728e711d6297e5a532c9b1",
        "md5_image": "003800aa65db8a17aebf36da46c6019a",
        "time_add": 1761966085,
        "artist": {
          "id": "2908",
          "name": "Édith Piaf",
          "link": "https://www.deezer.com/artist/2908",
          "tracklist": "https://api.deezer.com/artist/2908/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "6322687",
          "title": "Edith Piaf",
          "upc": "887845507655",
          "cover": "https://api.deezer.com/album/6322687/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/003800aa65db8a17aebf36da46c6019a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/003800aa65db8a17aebf36da46c6019a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/003800aa65db8a17aebf36da46c6019a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/003800aa65db8a17aebf36da46c6019a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "003800aa65db8a17aebf36da46c6019a",
          "tracklist": "https://api.deezer.com/album/6322687/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "577667932",
        "readable": false,
        "title": "A Whiter Shade of Pale (Original Single Version)",
        "title_short": "A Whiter Shade of Pale",
        "title_version": "(Original Single Version)",
        "isrc": "GBBWX0701000",
        "link": "https://www.deezer.com/track/577667932",
        "duration": "248",
        "rank": "10229",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "",
        "md5_image": "433c807e2a697879df5e306e86d12314",
        "time_add": 1703151038,
        "artist": {
          "id": "2053",
          "name": "Procol Harum",
          "link": "https://www.deezer.com/artist/2053",
          "tracklist": "https://api.deezer.com/artist/2053/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "77251762",
          "title": "A Whiter Shade of Pale (Original Single Version)",
          "upc": "5016959003219",
          "cover": "https://api.deezer.com/album/77251762/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/433c807e2a697879df5e306e86d12314/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/433c807e2a697879df5e306e86d12314/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/433c807e2a697879df5e306e86d12314/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/433c807e2a697879df5e306e86d12314/1000x1000-000000-80-0-0.jpg",
          "md5_image": "433c807e2a697879df5e306e86d12314",
          "tracklist": "https://api.deezer.com/album/77251762/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "3091964",
        "readable": true,
        "title": "I Get Around (Remastered 2001)",
        "title_short": "I Get Around",
        "title_version": "(Remastered 2001)",
        "isrc": "USCA20001635",
        "link": "https://www.deezer.com/track/3091964",
        "duration": "132",
        "rank": "711836",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/9/5/0/0/950426545dbf3736ba35ca574bf0bbed.mp3?hdnea=exp=1764979668~acl=/api/1/1/9/5/0/0/950426545dbf3736ba35ca574bf0bbed.mp3*~data=user_id=0,application_id=42~hmac=9b1ad6226daa5b79c6251a1df3934166188a29b0111bc59549a0fa8419583aa5",
        "md5_image": "ab113555b056cb808b050dff43a9590a",
        "time_add": 1749264380,
        "artist": {
          "id": "2179",
          "name": "The Beach Boys",
          "link": "https://www.deezer.com/artist/2179",
          "tracklist": "https://api.deezer.com/artist/2179/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "299377",
          "title": "The Very Best Of The Beach Boys: Sounds Of Summer",
          "upc": "724358271058",
          "cover": "https://api.deezer.com/album/299377/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/ab113555b056cb808b050dff43a9590a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/ab113555b056cb808b050dff43a9590a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/ab113555b056cb808b050dff43a9590a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/ab113555b056cb808b050dff43a9590a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "ab113555b056cb808b050dff43a9590a",
          "tracklist": "https://api.deezer.com/album/299377/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "906545",
        "readable": true,
        "title": "It's Not Unusual",
        "title_short": "It's Not Unusual",
        "title_version": "",
        "isrc": "GBF076520010",
        "link": "https://www.deezer.com/track/906545",
        "duration": "118",
        "rank": "649801",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/a/4/c/0/a4c9c6680c731e299673cbce044f41c9.mp3?hdnea=exp=1764979668~acl=/api/1/1/a/4/c/0/a4c9c6680c731e299673cbce044f41c9.mp3*~data=user_id=0,application_id=42~hmac=fc2e6b536d6849494fd37d7c31426f76941bb542dc37a69e73f8f7d4022892c7",
        "md5_image": "a07c10e54cdbd9b706658a98c174e8c7",
        "time_add": 1759546869,
        "artist": {
          "id": "903",
          "name": "Tom Jones",
          "link": "https://www.deezer.com/artist/903",
          "tracklist": "https://api.deezer.com/artist/903/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "102386",
          "title": "'60s Pop Number 1's",
          "upc": "600753014561",
          "cover": "https://api.deezer.com/album/102386/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/a07c10e54cdbd9b706658a98c174e8c7/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/a07c10e54cdbd9b706658a98c174e8c7/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/a07c10e54cdbd9b706658a98c174e8c7/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/a07c10e54cdbd9b706658a98c174e8c7/1000x1000-000000-80-0-0.jpg",
          "md5_image": "a07c10e54cdbd9b706658a98c174e8c7",
          "tracklist": "https://api.deezer.com/album/102386/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "409932002",
        "readable": true,
        "title": "Mes mains sur tes hanches",
        "title_short": "Mes mains sur tes hanches",
        "title_version": "",
        "isrc": "BEI016506004",
        "link": "https://www.deezer.com/track/409932002",
        "duration": "178",
        "rank": "576898",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/f/2/e/0/f2e125b2a07eafbf6553ecd3b45797af.mp3?hdnea=exp=1764979668~acl=/api/1/1/f/2/e/0/f2e125b2a07eafbf6553ecd3b45797af.mp3*~data=user_id=0,application_id=42~hmac=814f170de9d8ff3d11a4a9e0c705c97f9706a2bea3c077c06b6220f358795b2e",
        "md5_image": "0545392ac015d63d865c4ce3db85d6ba",
        "time_add": 1761966085,
        "artist": {
          "id": "160518",
          "name": "Salvatore Adamo",
          "link": "https://www.deezer.com/artist/160518",
          "tracklist": "https://api.deezer.com/artist/160518/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "48705982",
          "title": "Ses plus belles chansons",
          "upc": "5414940003482",
          "cover": "https://api.deezer.com/album/48705982/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/0545392ac015d63d865c4ce3db85d6ba/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/0545392ac015d63d865c4ce3db85d6ba/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/0545392ac015d63d865c4ce3db85d6ba/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/0545392ac015d63d865c4ce3db85d6ba/1000x1000-000000-80-0-0.jpg",
          "md5_image": "0545392ac015d63d865c4ce3db85d6ba",
          "tracklist": "https://api.deezer.com/album/48705982/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "690887",
        "readable": true,
        "title": "Last Night",
        "title_short": "Last Night",
        "title_version": "",
        "isrc": "USAT20001001",
        "link": "https://www.deezer.com/track/690887",
        "duration": "157",
        "rank": "421740",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/f/2/2/0/f2206a2dc523c6cfb9ac2d7ce2aa6031.mp3?hdnea=exp=1764979668~acl=/api/1/1/f/2/2/0/f2206a2dc523c6cfb9ac2d7ce2aa6031.mp3*~data=user_id=0,application_id=42~hmac=872661a333869e75d5a09c32697f61220fc3af934e4a353eea2949534eb8391e",
        "md5_image": "3b88491acdd1dc2789e34b2f847bc81a",
        "time_add": 1703151038,
        "artist": {
          "id": "66397",
          "name": "The Mar-Keys",
          "link": "https://www.deezer.com/artist/66397",
          "tracklist": "https://api.deezer.com/artist/66397/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "83191",
          "title": "Stax/Volt - The Complete Singles 1959-1968 - Volume 1",
          "upc": "603497999217",
          "cover": "https://api.deezer.com/album/83191/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/3b88491acdd1dc2789e34b2f847bc81a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/3b88491acdd1dc2789e34b2f847bc81a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/3b88491acdd1dc2789e34b2f847bc81a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/3b88491acdd1dc2789e34b2f847bc81a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "3b88491acdd1dc2789e34b2f847bc81a",
          "tracklist": "https://api.deezer.com/album/83191/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "691951",
        "readable": true,
        "title": "(Sittin' On) the Dock of the Bay",
        "title_short": "(Sittin' On) the Dock of the Bay",
        "title_version": "",
        "isrc": "USAT29900865",
        "link": "https://www.deezer.com/track/691951",
        "duration": "166",
        "rank": "457634",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/a/8/4/0/a84d5651041c7d8d8718dd94905e2980.mp3?hdnea=exp=1764979668~acl=/api/1/1/a/8/4/0/a84d5651041c7d8d8718dd94905e2980.mp3*~data=user_id=0,application_id=42~hmac=137e9f642477acde1fec12c628140dcf4847382a17444f13e358b7ee6cef1b54",
        "md5_image": "6612e8ffd91e34ea65745edaf7d20b9a",
        "time_add": 1703151038,
        "artist": {
          "id": "2945",
          "name": "Otis Redding",
          "link": "https://www.deezer.com/artist/2945",
          "tracklist": "https://api.deezer.com/artist/2945/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "83271",
          "title": "Definitive Soul: Otis Redding",
          "upc": "603497999422",
          "cover": "https://api.deezer.com/album/83271/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/6612e8ffd91e34ea65745edaf7d20b9a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/6612e8ffd91e34ea65745edaf7d20b9a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/6612e8ffd91e34ea65745edaf7d20b9a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/6612e8ffd91e34ea65745edaf7d20b9a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "6612e8ffd91e34ea65745edaf7d20b9a",
          "tracklist": "https://api.deezer.com/album/83271/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "2043943",
        "readable": true,
        "title": "Happy Together",
        "title_short": "Happy Together",
        "title_version": "",
        "isrc": "USA560587940",
        "link": "https://www.deezer.com/track/2043943",
        "duration": "176",
        "rank": "753943",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/9/9/8/0/998867c9116e5658d44f3d4e9e0c9b2c.mp3?hdnea=exp=1764979668~acl=/api/1/1/9/9/8/0/998867c9116e5658d44f3d4e9e0c9b2c.mp3*~data=user_id=0,application_id=42~hmac=c622b32da68939281fefaaa24acd89d53cbf9a2ba2a5e0bfd4cfa425a5e00860",
        "md5_image": "f4c9d49cd251dd538e9f38ff83e3f46c",
        "time_add": 1749264380,
        "artist": {
          "id": "4194",
          "name": "The Turtles",
          "link": "https://www.deezer.com/artist/4194",
          "tracklist": "https://api.deezer.com/artist/4194/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "205689",
          "title": "Happy Together",
          "upc": "669910341865",
          "cover": "https://api.deezer.com/album/205689/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/f4c9d49cd251dd538e9f38ff83e3f46c/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/f4c9d49cd251dd538e9f38ff83e3f46c/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/f4c9d49cd251dd538e9f38ff83e3f46c/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/f4c9d49cd251dd538e9f38ff83e3f46c/1000x1000-000000-80-0-0.jpg",
          "md5_image": "f4c9d49cd251dd538e9f38ff83e3f46c",
          "tracklist": "https://api.deezer.com/album/205689/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "5097410",
        "readable": true,
        "title": "Poupee De Cire Poupee De Son",
        "title_short": "Poupee De Cire Poupee De Son",
        "title_version": "",
        "isrc": "ARG990900942",
        "link": "https://www.deezer.com/track/5097410",
        "duration": "153",
        "rank": "511855",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/0/d/2/0/0d2e82edb4d28c91b89a6c9bdb852f66.mp3?hdnea=exp=1764979668~acl=/api/1/1/0/d/2/0/0d2e82edb4d28c91b89a6c9bdb852f66.mp3*~data=user_id=0,application_id=42~hmac=3c89e124fb630611f89877e797ca779cf6731a76d4355003940deabb040c6291",
        "md5_image": "57f9b43ad8467518f36166ace847bd63",
        "time_add": 1703151038,
        "artist": {
          "id": "4675",
          "name": "France Gall",
          "link": "https://www.deezer.com/artist/4675",
          "tracklist": "https://api.deezer.com/artist/4675/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "467581",
          "title": "Solo Ellas…",
          "upc": "884385623395",
          "cover": "https://api.deezer.com/album/467581/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/57f9b43ad8467518f36166ace847bd63/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/57f9b43ad8467518f36166ace847bd63/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/57f9b43ad8467518f36166ace847bd63/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/57f9b43ad8467518f36166ace847bd63/1000x1000-000000-80-0-0.jpg",
          "md5_image": "57f9b43ad8467518f36166ace847bd63",
          "tracklist": "https://api.deezer.com/album/467581/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "102398590",
        "readable": false,
        "title": "Capri c'est fini",
        "title_short": "Capri c'est fini",
        "title_version": "",
        "isrc": "BET231531742",
        "link": "https://www.deezer.com/track/102398590",
        "duration": "212",
        "rank": "384",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "",
        "md5_image": "79c9f2df01c7415a7079927f493f3a77",
        "time_add": 1703151038,
        "artist": {
          "id": "85917",
          "name": "Herve Villard",
          "link": "https://www.deezer.com/artist/85917",
          "tracklist": "https://api.deezer.com/artist/85917/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "10635740",
          "title": "Sur la route des 60's, Vol. 1",
          "upc": "3614593236943",
          "cover": "https://api.deezer.com/album/10635740/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/79c9f2df01c7415a7079927f493f3a77/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/79c9f2df01c7415a7079927f493f3a77/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/79c9f2df01c7415a7079927f493f3a77/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/79c9f2df01c7415a7079927f493f3a77/1000x1000-000000-80-0-0.jpg",
          "md5_image": "79c9f2df01c7415a7079927f493f3a77",
          "tracklist": "https://api.deezer.com/album/10635740/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "625721022",
        "readable": true,
        "title": "La Mamma (French Version)",
        "title_short": "La Mamma",
        "title_version": "(French Version)",
        "isrc": "FRZ116300690",
        "link": "https://www.deezer.com/track/625721022",
        "duration": "223",
        "rank": "512792",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/0/3/a/0/03a5b4334987fba4a4e1e24bad224129.mp3?hdnea=exp=1764979668~acl=/api/1/1/0/3/a/0/03a5b4334987fba4a4e1e24bad224129.mp3*~data=user_id=0,application_id=42~hmac=129c9738463aa0bd8e743e6929b6dc1034ee2a05febaceee2fe13718d2c67850",
        "md5_image": "545348fbf91157983e6b77bb5a6a03a0",
        "time_add": 1759546869,
        "artist": {
          "id": "1001",
          "name": "Charles Aznavour",
          "link": "https://www.deezer.com/artist/1001",
          "tracklist": "https://api.deezer.com/artist/1001/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "85966412",
          "title": "L'album de sa vie 100 titres",
          "upc": "600753864098",
          "cover": "https://api.deezer.com/album/85966412/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/545348fbf91157983e6b77bb5a6a03a0/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/545348fbf91157983e6b77bb5a6a03a0/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/545348fbf91157983e6b77bb5a6a03a0/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/545348fbf91157983e6b77bb5a6a03a0/1000x1000-000000-80-0-0.jpg",
          "md5_image": "545348fbf91157983e6b77bb5a6a03a0",
          "tracklist": "https://api.deezer.com/album/85966412/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1230327212",
        "readable": false,
        "title": "Retiens la nuit",
        "title_short": "Retiens la nuit",
        "title_version": "",
        "isrc": "FRZ036103660",
        "link": "https://www.deezer.com/track/1230327212",
        "duration": "173",
        "rank": "13922",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "",
        "md5_image": "97d77ceaa7a5f55d4a843d77e23abd9f",
        "time_add": 1751684233,
        "artist": {
          "id": "1060",
          "name": "Johnny Hallyday",
          "link": "https://www.deezer.com/artist/1060",
          "tracklist": "https://api.deezer.com/artist/1060/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "204678022",
          "title": "Que je t'aime",
          "upc": "602435816203",
          "cover": "https://api.deezer.com/album/204678022/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/97d77ceaa7a5f55d4a843d77e23abd9f/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/97d77ceaa7a5f55d4a843d77e23abd9f/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/97d77ceaa7a5f55d4a843d77e23abd9f/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/97d77ceaa7a5f55d4a843d77e23abd9f/1000x1000-000000-80-0-0.jpg",
          "md5_image": "97d77ceaa7a5f55d4a843d77e23abd9f",
          "tracklist": "https://api.deezer.com/album/204678022/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "795210",
        "readable": true,
        "title": "L'école est finie (Version stéréo)",
        "title_short": "L'école est finie",
        "title_version": "(Version stéréo)",
        "isrc": "FRZ166300010",
        "link": "https://www.deezer.com/track/795210",
        "duration": "159",
        "rank": "504892",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 6,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/8/c/b/0/8cbb7c4dd347748c7ec91355595ed617.mp3?hdnea=exp=1764979668~acl=/api/1/1/8/c/b/0/8cbb7c4dd347748c7ec91355595ed617.mp3*~data=user_id=0,application_id=42~hmac=244282513b3121d76d7742e20b26b2e774648adc6f9a5c8351efbc586729bad0",
        "md5_image": "81a344323b7b542e0f360572185bbf5a",
        "time_add": 1757127188,
        "artist": {
          "id": "2881",
          "name": "Sheila",
          "link": "https://www.deezer.com/artist/2881",
          "tracklist": "https://api.deezer.com/artist/2881/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "92869",
          "title": "Sheila (Compilation 2006)",
          "upc": "643443739863",
          "cover": "https://api.deezer.com/album/92869/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/81a344323b7b542e0f360572185bbf5a/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/81a344323b7b542e0f360572185bbf5a/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/81a344323b7b542e0f360572185bbf5a/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/81a344323b7b542e0f360572185bbf5a/1000x1000-000000-80-0-0.jpg",
          "md5_image": "81a344323b7b542e0f360572185bbf5a",
          "tracklist": "https://api.deezer.com/album/92869/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "100325278",
        "readable": false,
        "title": "Hit the Road Jack",
        "title_short": "Hit the Road Jack",
        "title_version": "",
        "isrc": "DEBL60532246",
        "link": "https://www.deezer.com/track/100325278",
        "duration": "117",
        "rank": "11847",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "",
        "md5_image": "44c077f57a29e7958bced910d4300a50",
        "time_add": 1703151038,
        "artist": {
          "id": "1342",
          "name": "Ray Charles",
          "link": "https://www.deezer.com/artist/1342",
          "tracklist": "https://api.deezer.com/artist/1342/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "10271832",
          "title": "The Anthology",
          "upc": "3614591590535",
          "cover": "https://api.deezer.com/album/10271832/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/44c077f57a29e7958bced910d4300a50/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/44c077f57a29e7958bced910d4300a50/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/44c077f57a29e7958bced910d4300a50/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/44c077f57a29e7958bced910d4300a50/1000x1000-000000-80-0-0.jpg",
          "md5_image": "44c077f57a29e7958bced910d4300a50",
          "tracklist": "https://api.deezer.com/album/10271832/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "12711462",
        "readable": false,
        "title": "San Francisco",
        "title_short": "San Francisco",
        "title_version": "",
        "isrc": "FRZ027200330",
        "link": "https://www.deezer.com/track/12711462",
        "duration": "165",
        "rank": "821005",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/0/b/9/0/0b9726d82dd933dab036dd6f12e34ec8.mp3?hdnea=exp=1764979668~acl=/api/1/1/0/b/9/0/0b9726d82dd933dab036dd6f12e34ec8.mp3*~data=user_id=0,application_id=42~hmac=da99c764fc7f880fadcb57a4995e6ab95f919d0333e2d9ccb582671f50e1f217",
        "md5_image": "8d0d44d088a81d820578f2a95c547bef",
        "time_add": 1703151038,
        "artist": {
          "id": "3192",
          "name": "Maxime Le Forestier",
          "link": "https://www.deezer.com/artist/3192",
          "tracklist": "https://api.deezer.com/artist/3192/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "1166411",
          "title": "Mon Frère",
          "upc": "602527742182",
          "cover": "https://api.deezer.com/album/1166411/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/8d0d44d088a81d820578f2a95c547bef/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/8d0d44d088a81d820578f2a95c547bef/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/8d0d44d088a81d820578f2a95c547bef/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/8d0d44d088a81d820578f2a95c547bef/1000x1000-000000-80-0-0.jpg",
          "md5_image": "8d0d44d088a81d820578f2a95c547bef",
          "tracklist": "https://api.deezer.com/album/1166411/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1055776",
        "readable": true,
        "title": "Suspicious Minds",
        "title_short": "Suspicious Minds",
        "title_version": "",
        "isrc": "USRC16908317",
        "link": "https://www.deezer.com/track/1055776",
        "duration": "194",
        "rank": "756139",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/d/1/a/0/d1a492b30715f528ed6de3c6faaf713e.mp3?hdnea=exp=1764979668~acl=/api/1/1/d/1/a/0/d1a492b30715f528ed6de3c6faaf713e.mp3*~data=user_id=0,application_id=42~hmac=cb9dd9ce26f26b48adbd3eb6a4cdfd1fb421e3a34b3b5d04b86927b7056ec318",
        "md5_image": "3598c1cdd425022000eba13ade236e8d",
        "time_add": 1740796802,
        "artist": {
          "id": "1125",
          "name": "Elvis Presley",
          "link": "https://www.deezer.com/artist/1125",
          "tracklist": "https://api.deezer.com/artist/1125/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "114857",
          "title": "From Nashville To Memphis - The Essential 60s Masters I",
          "upc": "743211543026",
          "cover": "https://api.deezer.com/album/114857/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/3598c1cdd425022000eba13ade236e8d/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/3598c1cdd425022000eba13ade236e8d/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/3598c1cdd425022000eba13ade236e8d/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/3598c1cdd425022000eba13ade236e8d/1000x1000-000000-80-0-0.jpg",
          "md5_image": "3598c1cdd425022000eba13ade236e8d",
          "tracklist": "https://api.deezer.com/album/114857/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "86285553",
        "readable": false,
        "title": "Rock Around the Clock",
        "title_short": "Rock Around the Clock",
        "title_version": "",
        "isrc": "DEBL60338837",
        "link": "https://www.deezer.com/track/86285553",
        "duration": "138",
        "rank": "1457",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "",
        "md5_image": "fdb965ddccc7a51ed1b6fdd55743ee2c",
        "time_add": 1703151038,
        "artist": {
          "id": "15003",
          "name": "Bill Haley",
          "link": "https://www.deezer.com/artist/15003",
          "tracklist": "https://api.deezer.com/artist/15003/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "8703767",
          "title": "Rudy's Rock",
          "upc": "3610158591366",
          "cover": "https://api.deezer.com/album/8703767/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/fdb965ddccc7a51ed1b6fdd55743ee2c/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/fdb965ddccc7a51ed1b6fdd55743ee2c/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/fdb965ddccc7a51ed1b6fdd55743ee2c/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/fdb965ddccc7a51ed1b6fdd55743ee2c/1000x1000-000000-80-0-0.jpg",
          "md5_image": "fdb965ddccc7a51ed1b6fdd55743ee2c",
          "tracklist": "https://api.deezer.com/album/8703767/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "727540",
        "readable": true,
        "title": "When a Man Loves a Woman",
        "title_short": "When a Man Loves a Woman",
        "title_version": "",
        "isrc": "USAT29902050",
        "link": "https://www.deezer.com/track/727540",
        "duration": "173",
        "rank": "531297",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/9/6/5/0/965f54a683740499a5a79af00507da10.mp3?hdnea=exp=1764979668~acl=/api/1/1/9/6/5/0/965f54a683740499a5a79af00507da10.mp3*~data=user_id=0,application_id=42~hmac=e7820fd9921a9ca7f469a3888eca8a7236cc9d61c429281f1c12c36c6db4193d",
        "md5_image": "cb9cd3ff4da779845c681baf2241570e",
        "time_add": 1703151038,
        "artist": {
          "id": "1890",
          "name": "Percy Sledge",
          "link": "https://www.deezer.com/artist/1890",
          "tracklist": "https://api.deezer.com/artist/1890/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "86688",
          "title": "When a Man Loves a Woman",
          "upc": "081227855468",
          "cover": "https://api.deezer.com/album/86688/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/cb9cd3ff4da779845c681baf2241570e/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/cb9cd3ff4da779845c681baf2241570e/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/cb9cd3ff4da779845c681baf2241570e/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/cb9cd3ff4da779845c681baf2241570e/1000x1000-000000-80-0-0.jpg",
          "md5_image": "cb9cd3ff4da779845c681baf2241570e",
          "tracklist": "https://api.deezer.com/album/86688/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "540428",
        "readable": false,
        "title": "Les cactus",
        "title_short": "Les cactus",
        "title_version": "",
        "isrc": "FRZ196600080",
        "link": "https://www.deezer.com/track/540428",
        "duration": "160",
        "rank": "613664",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/7/a/3/0/7a3c560261cb16e1d0777daddc4f3fbf.mp3?hdnea=exp=1764979668~acl=/api/1/1/7/a/3/0/7a3c560261cb16e1d0777daddc4f3fbf.mp3*~data=user_id=0,application_id=42~hmac=98eeaf69a71da23b63d5f49aa87b3d9b54d4a84ea14cab504655d37ace9eca19",
        "md5_image": "4b3410fb489d544ce96cf32cd768f8dc",
        "time_add": 1703151038,
        "artist": {
          "id": "7308",
          "name": "Jacques Dutronc",
          "link": "https://www.deezer.com/artist/7308",
          "tracklist": "https://api.deezer.com/artist/7308/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "71589",
          "title": "En Vogue",
          "upc": "888880430328",
          "cover": "https://api.deezer.com/album/71589/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/4b3410fb489d544ce96cf32cd768f8dc/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/4b3410fb489d544ce96cf32cd768f8dc/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/4b3410fb489d544ce96cf32cd768f8dc/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/4b3410fb489d544ce96cf32cd768f8dc/1000x1000-000000-80-0-0.jpg",
          "md5_image": "4b3410fb489d544ce96cf32cd768f8dc",
          "tracklist": "https://api.deezer.com/album/71589/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1182497",
        "readable": true,
        "title": "Baby Love (Single Version)",
        "title_short": "Baby Love",
        "title_version": "(Single Version)",
        "isrc": "USMO16482615",
        "link": "https://www.deezer.com/track/1182497",
        "duration": "155",
        "rank": "705797",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/c/6/0/6c68c006912626d7480fb8f61a5822a1.mp3?hdnea=exp=1764979668~acl=/api/1/1/6/c/6/0/6c68c006912626d7480fb8f61a5822a1.mp3*~data=user_id=0,application_id=42~hmac=f61e99178ec29607ea44be000d296cfe1f7490e620fa2e45dcaac8b2ca35bc09",
        "md5_image": "2b54e7c2501c16d2c6cbe34e9d2c55ff",
        "time_add": 1749264380,
        "artist": {
          "id": "2162",
          "name": "The Supremes",
          "link": "https://www.deezer.com/artist/2162",
          "tracklist": "https://api.deezer.com/artist/2162/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "126348",
          "title": "Where Did Our Love Go: 40th Anniversary Edition",
          "upc": "602498645239",
          "cover": "https://api.deezer.com/album/126348/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/2b54e7c2501c16d2c6cbe34e9d2c55ff/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/2b54e7c2501c16d2c6cbe34e9d2c55ff/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/2b54e7c2501c16d2c6cbe34e9d2c55ff/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/2b54e7c2501c16d2c6cbe34e9d2c55ff/1000x1000-000000-80-0-0.jpg",
          "md5_image": "2b54e7c2501c16d2c6cbe34e9d2c55ff",
          "tracklist": "https://api.deezer.com/album/126348/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "2171224",
        "readable": true,
        "title": "At Last",
        "title_short": "At Last",
        "title_version": "",
        "isrc": "USMC16046323",
        "link": "https://www.deezer.com/track/2171224",
        "duration": "180",
        "rank": "832933",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/a/1/d/0/a1d0a9c9c56a2aa462c54e9ff4d6ea12.mp3?hdnea=exp=1764979668~acl=/api/1/1/a/1/d/0/a1d0a9c9c56a2aa462c54e9ff4d6ea12.mp3*~data=user_id=0,application_id=42~hmac=d04397348b33f797a261674a9c9d0c0fbe8299fac1b4a1903749a6e0c7d26e56",
        "md5_image": "793a7368c289b642ed327f92414d097f",
        "time_add": 1751684233,
        "artist": {
          "id": "620",
          "name": "Etta James",
          "link": "https://www.deezer.com/artist/620",
          "tracklist": "https://api.deezer.com/artist/620/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "217268",
          "title": "At Last!",
          "upc": "008811201722",
          "cover": "https://api.deezer.com/album/217268/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/793a7368c289b642ed327f92414d097f/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/793a7368c289b642ed327f92414d097f/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/793a7368c289b642ed327f92414d097f/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/793a7368c289b642ed327f92414d097f/1000x1000-000000-80-0-0.jpg",
          "md5_image": "793a7368c289b642ed327f92414d097f",
          "tracklist": "https://api.deezer.com/album/217268/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "5702259",
        "readable": true,
        "title": "Belles belles belles",
        "title_short": "Belles belles belles",
        "title_version": "",
        "isrc": "FRZ036200760",
        "link": "https://www.deezer.com/track/5702259",
        "duration": "130",
        "rank": "611775",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/b/7/6/0/b76dd4d51ae38508f6bf795cfa67adf1.mp3?hdnea=exp=1764979668~acl=/api/1/1/b/7/6/0/b76dd4d51ae38508f6bf795cfa67adf1.mp3*~data=user_id=0,application_id=42~hmac=d9b9393bbb4de14e00f80b6322c66e9426e4715917311beefb89a8073d2f9fee",
        "md5_image": "42081678ef2e95cfd4a92f895b8516b3",
        "time_add": 1703151038,
        "artist": {
          "id": "306",
          "name": "Claude François",
          "link": "https://www.deezer.com/artist/306",
          "tracklist": "https://api.deezer.com/artist/306/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "520679",
          "title": "Si J'Avais Un Marteau",
          "upc": "731454835329",
          "cover": "https://api.deezer.com/album/520679/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/42081678ef2e95cfd4a92f895b8516b3/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/42081678ef2e95cfd4a92f895b8516b3/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/42081678ef2e95cfd4a92f895b8516b3/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/42081678ef2e95cfd4a92f895b8516b3/1000x1000-000000-80-0-0.jpg",
          "md5_image": "42081678ef2e95cfd4a92f895b8516b3",
          "tracklist": "https://api.deezer.com/album/520679/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "104816990",
        "readable": true,
        "title": "La Bamba",
        "title_short": "La Bamba",
        "title_version": "",
        "isrc": "DK5C50052192",
        "link": "https://www.deezer.com/track/104816990",
        "duration": "128",
        "rank": "522613",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/6/5/1/0/651690dd06a98a83dbba7757c3bb0060.mp3?hdnea=exp=1764979668~acl=/api/1/1/6/5/1/0/651690dd06a98a83dbba7757c3bb0060.mp3*~data=user_id=0,application_id=42~hmac=e62f01f0693e375c2b37e70ba67796c555d9429801b5764da84b4a59214e17f2",
        "md5_image": "8c28162554542986db891ff3c31fa768",
        "time_add": 1751684233,
        "artist": {
          "id": "11731",
          "name": "Ritchie Valens",
          "link": "https://www.deezer.com/artist/11731",
          "tracklist": "https://api.deezer.com/artist/11731/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "10912920",
          "title": "Donna",
          "upc": "5712192135365",
          "cover": "https://api.deezer.com/album/10912920/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/8c28162554542986db891ff3c31fa768/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/8c28162554542986db891ff3c31fa768/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/8c28162554542986db891ff3c31fa768/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/8c28162554542986db891ff3c31fa768/1000x1000-000000-80-0-0.jpg",
          "md5_image": "8c28162554542986db891ff3c31fa768",
          "tracklist": "https://api.deezer.com/album/10912920/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "1068264862",
        "readable": false,
        "title": "Pepito",
        "title_short": "Pepito",
        "title_version": "",
        "isrc": "FRX762025512",
        "link": "https://www.deezer.com/track/1068264862",
        "duration": "187",
        "rank": "471",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "",
        "md5_image": "d49a3efc967de5fa4ab9b4d8a377eeb6",
        "time_add": 1703151038,
        "artist": {
          "id": "81112",
          "name": "Los Machucambos",
          "link": "https://www.deezer.com/artist/81112",
          "tracklist": "https://api.deezer.com/artist/81112/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "170781312",
          "title": "The Yellow Rose of Texas",
          "upc": "3616408572666",
          "cover": "https://api.deezer.com/album/170781312/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/d49a3efc967de5fa4ab9b4d8a377eeb6/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/d49a3efc967de5fa4ab9b4d8a377eeb6/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/d49a3efc967de5fa4ab9b4d8a377eeb6/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/d49a3efc967de5fa4ab9b4d8a377eeb6/1000x1000-000000-80-0-0.jpg",
          "md5_image": "d49a3efc967de5fa4ab9b4d8a377eeb6",
          "tracklist": "https://api.deezer.com/album/170781312/tracks",
          "type": "album"
        },
        "type": "track"
      },
      {
        "id": "564048052",
        "readable": false,
        "title": "Inch' allah",
        "title_short": "Inch' allah",
        "title_version": "",
        "isrc": "FR96X1850131",
        "link": "https://www.deezer.com/track/564048052",
        "duration": "286",
        "rank": "24990",
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 2,
        "preview": "",
        "md5_image": "080d4f1ebb5f150560d38487a4e48348",
        "time_add": 1703151038,
        "artist": {
          "id": "160518",
          "name": "Salvatore Adamo",
          "link": "https://www.deezer.com/artist/160518",
          "tracklist": "https://api.deezer.com/artist/160518/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": "74863302",
          "title": "Souvenirs De France, Vol. 1",
          "upc": "3615934675902",
          "cover": "https://api.deezer.com/album/74863302/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/080d4f1ebb5f150560d38487a4e48348/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/080d4f1ebb5f150560d38487a4e48348/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/080d4f1ebb5f150560d38487a4e48348/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/080d4f1ebb5f150560d38487a4e48348/1000x1000-000000-80-0-0.jpg",
          "md5_image": "080d4f1ebb5f150560d38487a4e48348",
          "tracklist": "https://api.deezer.com/album/74863302/tracks",
          "type": "album"
        },
        "type": "track"
      }
    ],
    "checksum": "eadc7113a8d041ea25a7d9cd13d0dca3"
  }
}

playlist / seen	GET method is not available. Please check POST methods.	
playlist / fans	Return a list of playlist's fans. Represented by an array of User objects	A list of object of type user
playlist / tracks	Return a list of playlist's tracks. Represented by an array of Track object	A list of object of type track
playlist / radio	Return a list of playlist's recommendation tracks. Represented by an array of Track object	A list of object of type track