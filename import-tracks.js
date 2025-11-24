const https = require('https');
const fs = require('fs');
const querystring = require('querystring');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function searchTracks(query, limit = 10) {
  return new Promise((resolve, reject) => {
    const params = querystring.stringify({
      q: query,
      limit: limit
    });

    const req = https.request({
      hostname: 'api.deezer.com',
      path: `/search?${params}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MusicApp-Coursework/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (!response.data || !Array.isArray(response.data)) {
            return reject(new Error(`No tracks for: ${query}`));
          }

          const tracks = response.data.map(item => ({
            id: item.id.toString(),
            name: item.title,
            artist: item.artist.name,
            album: item.album.title,
            preview_url: item.preview,
            duration_ms: item.duration * 1000,
            popularity: item.rank
          }));

          resolve(tracks);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout for: ${query}`));
    });
    req.end();
  });
}

async function fetchTracks() {
  try {
    console.log('🔍 Запрос треков из Deezer API...');
    
    // Рабочие запросы — по артистам и трекам
    const queries = [
      'artist:"Ed Sheeran"',
      'artist:"The Weeknd"',
      'artist:"Tones and I"',
      'artist:"Radiohead"',
      'artist:"Linkin Park"',
      'track:"Shape of You"',
      'track:"Blinding Lights"',
      'track:"Dance Monkey"'
    ];

    let allTracks = [];

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`  → Запрос ${i + 1}/${queries.length}: ${query}`);
      
      try {
        const tracks = await searchTracks(query, 5);
        allTracks.push(...tracks);
        console.log(`    → Получено ${tracks.length} треков`);
      } catch (e) {
        console.warn(`    ⚠️ Пропущен: ${e.message}`);
      }

      if (i < queries.length - 1) {
        await sleep(2000); // 2 секунды пауза
      }
    }

    // Убираем дубликаты
    const uniqueTracks = allTracks.filter((track, index, self) =>
      index === self.findIndex(t => t.id === track.id)
    );

    // Сортируем по популярности
    uniqueTracks.sort((a, b) => b.popularity - a.popularity);

    // Берём топ 100
    const top100 = uniqueTracks.slice(0, 100);

    // Сохраняем
    fs.writeFileSync('data.json', JSON.stringify(top100, null, 2));
    console.log(`\n✅ Успешно сохранено ${top100.length} треков в data.json`);
    const withPreview = top100.filter(t => t.preview_url).length;
    console.log(`🎧 Сниппеты доступны для ${withPreview} из ${top100.length} треков`);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

fetchTracks();

/*
https://developers.deezer.com/api/explorer

Количество запросов в секунду ограничено 50 запросами / 5 секунд.

Примеры форматов запросов : 
https://api.deezer.com/user/2529
https://api.deezer.com/user/2529/playlists
https://api.deezer.com/album/302127

Optionnal Parameters (for all methods) : 
strict - Disable the fuzzy mode (?strict=on)
order - Possible values : RANKING, TRACK_ASC, TRACK_DESC, 
ARTIST_ASC, ARTIST_DESC, ALBUM_ASC, ALBUM_DESC, 
RATING_ASC, RATING_DESC, DURATION_ASC, DURATION_DESC

Fields
Name - Description	- Type
id	- The track's Deezer id -	int
readable	- true if the track is readable in the player for the current user -	boolean
title	- The track's fulltitle -	string
title_short -	The track's short title -	string
title_version -	The track version -	string
link -	The url of the track on Deezer -	url
duration -	The track's duration in seconds -	int
rank -	The track's Deezer rank -	int
explicit_lyrics -	Whether the track contains explicit lyrics -	boolean
preview	- The url of track's preview file. This file contains the first 30 seconds of the track	- url
artist -	artist object containing : id, name, link, picture, picture_small, picture_medium, picture_big, picture_xl	- object
album	- album object containing : id, title, cover, cover_small, cover_medium, cover_big, cover_xl -	object


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


Tracks

https://api.deezer.com/track/3135556

id - The track's Deezer id - int  
readable - true if the track is readable in the player for the current user - boolean  
title - The track's full title - string  
title_short - The track's short title - string  
title_version - The track version - string  
unseen - The track unseen status - boolean  
isrc - The track isrc - string  
link - The url of the track on Deezer - url  
share - The share link of the track on Deezer - url  
duration - The track's duration in seconds - int  
track_position - The position of the track in its album - int  
disk_number - The track's album's disk number - int  
rank - The track's Deezer rank - int  
release_date - The track's release date - date  
explicit_lyrics - Whether the track contains explicit lyrics - boolean  
explicit_content_lyrics - The explicit content lyrics values (0:Not Explicit; 1:Explicit; 2:Unknown; 3:Edited; 6:No Advice Available) - int  
explicit_content_cover - The explicit cover value (0:Not Explicit; 1:Explicit; 2:Unknown; 3:Edited; 6:No Advice Available) - int  
preview - The url of track's preview file. This file contains the first 30 seconds of the track - url  
bpm - Beats per minute - float  
gain - Signal strength - float  
available_countries - List of countries where the track is available - list  
alternative - Return an alternative readable track if the current track is not readable - track  
contributors - Return a list of contributors on the track - list  
md5_image -  - string  
track_token - The track token for media service - string  
artist - artist object containing: id, name, link, share, picture, picture_small, picture_medium, picture_big, picture_xl, nb_album, nb_fan, radio, tracklist, role - object  
album - album object containing: id, title, link, cover, cover_small, cover_medium, cover_big, cover_xl, release_date - object
*/