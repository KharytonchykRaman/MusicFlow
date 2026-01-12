function openEntity(type, id) {
  if (type === "album") {
    showAlbumPage(id);
  } else if (type === "artist") {
    showArtistPage(id);
  } else if (type === "playlist") {
    //showPlaylistPage(id);
  }
}

async function showAlbumPage(id) {
  const res = await fetch(`/api/album/${id}`);
  const data = await res.json();

  if (!res.ok) {
    alert("Ошибка загрузки альбома");
    return;
  }

  fillAlbumPage(data);
}

async function showArtistPage(id) {
  const res = await fetch(`/api/artist/${id}`);
  const data = await res.json();
  if (!res.ok) {
    alert("Ошибка загрузки артиста");
    return;
  }
  fillArtistPage(data);
}

function fillAlbumPage(album) {
  const center = document.getElementById("centerSection");
  center.innerHTML = "";

  const page = document.importNode(
    document.getElementById("albumPageTmpl").content,
    true
  );

  page.querySelector(".album-hero__cover").src = album.cover;
  page.querySelector(".album-hero__title").textContent = album.title;
  page.querySelector(".album-hero__year").textContent = album.release_date;

  const artistsList = page.getElementById("albumArtistsList");
  album.artists.forEach((ar) => {
    const chip = document.createElement("div");
    chip.className = "artist-chip";
    chip.dataset.id = ar.id;
    chip.dataset.type = "artist";
    chip.innerHTML = `
      <img class="artist-chip__img" src="${ar.picture}" alt="">
      <span class="artist-chip__name">${ar.name}</span>
    `;
    chip.addEventListener("click", () => openEntity("artist", ar.id));
    artistsList.appendChild(chip);
  });

  const likeBtn = page.querySelector(".album-like");
  likeBtn.addEventListener("click", () => likeBtn.classList.toggle("liked"));

  const trackList = page.getElementById("albumTrackList");
  album.tracks.forEach((tr, idx) => {
    const row = document.importNode(
      document.getElementById("trackRowTmpl").content,
      true
    );
    row.querySelector(".track").dataset.id = tr.id;
    row.querySelector(".track__num").textContent = (idx + 1)
      .toString()
      .padStart(2, "0");
    row.querySelector(".track__title").textContent = tr.title;
    row.querySelector(".track__artists").textContent = tr.artists
      .map((a) => a.name)
      .join(" ");
    row.querySelector(".track__rank").textContent = tr.rank;
    trackList.appendChild(row);
  });

  trackList.addEventListener("click", (e) => {
    debugger;
    const trackEl = e.target.closest(".track");
    if (!trackEl) return;

    const id = Number(trackEl.dataset.id);
    const title = trackEl.querySelector(".track__title").textContent.trim();
    const artists = album.tracks.find((tr) => tr.id === id).artists;

    loadTrackInPlayer(`/public/audio/${id}.mp3`, album.cover, title, artists);
    updateNowPlaying(title, artists, album.cover, album.title);
  });

  center.appendChild(page);
}

function fillArtistPage(data) {
  const center = document.getElementById("centerSection");
  center.innerHTML = "";

  const p = document.importNode(
    document.getElementById("artistPageTmpl").content,
    true
  );

  p.querySelector(".artist-hero__cover").src = data.picture;
  p.querySelector(".artist-hero__name").textContent = data.name;
  p.querySelector(
    ".artist-hero__stats"
  ).textContent = `${data.fans.toLocaleString()} подписчиков`;

  const followBtn = p.getElementById("followBtn");
  followBtn.addEventListener("click", () =>
    followBtn.classList.toggle("following")
  );

  const trackList = p.getElementById("artistTopTracks");
  data.topTracks.forEach((tr, idx) => {
    const row = document.importNode(
      document.getElementById("trackRowTmpl").content,
      true
    );
    row.querySelector(".track").dataset.id = tr.id;
    row.querySelector(".track__num").textContent = idx + 1;
    row.querySelector(".track__title").textContent = tr.title;
    row.querySelector(".track__artists").textContent = tr.artists
      .map((a) => a.name)
      .join(" ");
    row.querySelector(".track__rank").textContent = tr.rank;
    trackList.appendChild(row);
  });

  trackList.addEventListener("click", (e) => {
    const trackEl = e.target.closest(".track");
    if (!trackEl) return;

    const id = Number(trackEl.dataset.id);
    const track = data.topTracks.find((tr) => tr.id === id);

    loadTrackInPlayer(
      `/public/audio/${id}.mp3`,
      track.cover,
      track.title,
      track.artists
    );
    updateNowPlaying(track.title, track.artists, track.cover, track.title);
  });

  const albumsRow = p.getElementById("artistAlbums");
  data.albums.forEach((al) => {
    const clone = document.importNode(
      document.getElementById("cardTmpl").content,
      true
    );
    const card = clone.querySelector(".card");
    card.dataset.id = al.id;
    card.dataset.type = "album";
    card.addEventListener("click", () => openEntity("album", al.id));

    clone.querySelector(".card__cover img").src = al.cover;
    clone.querySelector(".card__title").textContent = al.title;
    clone.querySelector(".card__info").textContent = al.release_date.slice(
      0,
      4
    );
    albumsRow.appendChild(clone);
  });

  // const playlistsRow = p.getElementById("artistPlaylists");
  // data.playlists.forEach((pl) => {
  //   const clone = document.importNode(
  //     document.getElementById("cardTmpl").content,
  //     true
  //   );
  //   const card = clone.querySelector(".card");
  //   card.dataset.id = pl.id;
  //   card.dataset.type = "playlist";
  //   card.addEventListener("click", () => openEntity("playlist", pl.id));

  //   clone.querySelector(".card__cover img").src = pl.cover;
  //   clone.querySelector(".card__title").textContent = pl.title;
  //   clone.querySelector(".card__info").textContent = `${pl.nb_tracks} треков`;
  //   playlistsRow.appendChild(clone);
  // });

  center.appendChild(p);
}

function updateNowPlaying(title, artists, cover, album) {
  const tmpl = nowPlayingTmpl.content.cloneNode(true);
  tmpl.querySelector(".now-playing__album").textContent = album;
  tmpl.querySelector(".now-playing__cover").src = cover;
  tmpl.querySelector(".now-playing__title").textContent = title;

  artists.forEach((ar) => {
    const artistTmpl = compactTmpl.content.cloneNode(true);
    const el = artistTmpl.querySelector(".compact");

    el.querySelector(".compact__cover").src = ar.picture;
    el.querySelector(".compact__title").textContent = ar.name;
    el.querySelector(".compact__meta").textContent = "Исполнитель";
    el.dataset.id = ar.id;

    el.addEventListener("click", () => openEntity("artist", ar.id));

    tmpl.append(el);
  });

  leftSidebar.innerHTML = "";
  leftSidebar.appendChild(tmpl);
}

async function loadHomePageData() {
  const response = await fetch("/api/home");

  const data = await response.json();

  if (!response.ok || data.status === "Error") {
    alert(data?.message || "Internet error");
    return;
  }

  const { artists, playlists, albums } = data.data;

  const template = document.getElementById("cardTmpl");

  popularArtists.innerHTML = "";
  artists.forEach((artist) => {
    const clone = document.importNode(template.content, true);
    const card = clone.querySelector(".card");
    const img = clone.querySelector(".card__cover img");
    const title = clone.querySelector(".card__title");
    const info = clone.querySelector(".card__info");

    img.src = artist.picture.trim();
    title.textContent = artist.name;
    info.textContent = `${artist.fans.toLocaleString()} подписчиков`;

    card.dataset.id = artist.id;

    card.addEventListener("click", () => openEntity("artist", artist.id));

    popularArtists.appendChild(clone);
  });

  popularAlbums.innerHTML = "";
  albums.forEach((album) => {
    const clone = document.importNode(template.content, true);
    const card = clone.querySelector(".card");
    const img = clone.querySelector(".card__cover img");
    const title = clone.querySelector(".card__title");
    const info = clone.querySelector(".card__info");

    img.src = album.cover.trim();
    title.textContent = album.title;
    info.textContent = album.artists.map((a) => a.name).join(", ");

    card.dataset.id = album.id;

    card.addEventListener("click", () => openEntity("album", album.id));

    popularAlbums.appendChild(clone);
  });

  popularPlaylists.innerHTML = "";
  playlists.forEach((playlist) => {
    const clone = document.importNode(template.content, true);
    const card = clone.querySelector(".card");
    const img = clone.querySelector(".card__cover img");
    const title = clone.querySelector(".card__title");
    const info = clone.querySelector(".card__info");

    img.src = playlist.cover.trim();
    title.textContent = playlist.title;
    info.textContent = `${playlist.nb_tracks} треков`;

    card.dataset.id = playlist.id;

    card.addEventListener("click", () => openEntity("playlist", playlist.id));

    popularPlaylists.appendChild(clone);
  });
}

loadHomePageData();

const audio = document.getElementById("audioPlayer");
const playBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const curTimeEl = document.querySelector(".time.current");
const totalTimeEl = document.querySelector(".time.total");
const likeBtn = document.querySelector(".player-like");

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸";
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
});

progressBar.addEventListener("input", () => {
  const pct = progressBar.value / 100;
  audio.currentTime = pct * audio.duration || 0;
});

audio.addEventListener("timeupdate", () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressBar.value = pct;
  curTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});

volumeBar.addEventListener(
  "input",
  () => (audio.volume = volumeBar.value / 100)
);

likeBtn.addEventListener("click", () => likeBtn.classList.toggle("liked"));

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function loadTrackInPlayer(trackUrl, cover, title, artists) {
  audio.src = trackUrl;
  document.querySelector(".player-cover").src = cover;
  document.querySelector(".player-title").textContent = title;
  const artistsStr = artists.map((ar) => ar.name).join(" ");
  document.querySelector(".player-artist").textContent = artistsStr;
  playBtn.textContent = "▶";
  audio.load();
}

function showHomePage() {
  const center = document.getElementById("centerSection");
  center.innerHTML = "";

  const home = document.importNode(
    document.getElementById("homePageTmpl").content,
    true
  );
  center.appendChild(home);

  loadHomePageData();
}

homeButton.addEventListener("click", () => showHomePage());

const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;
  const q = searchInput.value.trim();
  if (!q) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  if (!res.ok) {
    alert("Ошибка поиска");
    return;
  }

  fillSearchPage(q, data.data);
});

function fillSearchPage(q, data) {
  const center = document.getElementById("centerSection");
  center.innerHTML = "";

  const p = document.importNode(
    document.getElementById("searchPageTmpl").content,
    true
  );

  const trackList = p.getElementById("searchTracks");
  if (!data.tracks.length) {
    trackList.innerHTML = `<li class="no-results">По запросу «${q}» треков не найдено</li>`;
  } else {
    data.tracks.forEach((tr, idx) => {
      const row = document.importNode(
        document.getElementById("trackRowTmpl").content,
        true
      );
      row.querySelector(".track").dataset.id = tr.id;
      row.querySelector(".track__num").textContent = idx + 1;
      row.querySelector(".track__title").textContent = tr.title;
      row.querySelector(".track__artists").textContent = tr.artists
        .map((a) => a.name)
        .join(", ");
      row.querySelector(".track__rank").textContent = tr.rank;
      trackList.appendChild(row);
    });
  }

  const artistsRow = p.getElementById("searchArtists");
  if (!data.artists.length) {
    artistsRow.innerHTML = `<div class="no-results">По запросу «${q}» артистов не найдено</div>`;
  } else {
    data.artists.forEach((ar) => {
      const clone = document.importNode(
        document.getElementById("cardTmpl").content,
        true
      );
      const card = clone.querySelector(".card");
      card.dataset.id = ar.id;
      card.dataset.type = "artist";
      card.addEventListener("click", () => openEntity("artist", ar.id));

      clone.querySelector(".card__cover img").src = ar.picture;
      clone.querySelector(".card__title").textContent = ar.name;
      clone.querySelector(
        ".card__info"
      ).textContent = `${ar.fans.toLocaleString()} подписчиков`;
      artistsRow.appendChild(clone);
    });
  }

  const albumsRow = p.getElementById("searchAlbums");
  if (!data.albums.length) {
    albumsRow.innerHTML = `<div class="no-results">По запросу «${q}» альбомов не найдено</div>`;
  } else {
    data.albums.forEach((al) => {
      const clone = document.importNode(
        document.getElementById("cardTmpl").content,
        true
      );
      const card = clone.querySelector(".card");
      card.dataset.id = al.id;
      card.dataset.type = "album";
      card.addEventListener("click", () => openEntity("album", al.id));

      clone.querySelector(".card__cover img").src = al.cover;
      clone.querySelector(".card__title").textContent = al.title;
      clone.querySelector(".card__info").textContent = al.release_date.slice(
        0,
        4
      );
      albumsRow.appendChild(clone);
    });
  }

  const playlistsRow = p.getElementById("searchPlaylists");
  if (!data.playlists.length) {
    playlistsRow.innerHTML = `<div class="no-results">По запросу «${q}» плейлистов не найдено</div>`;
  } else {
    data.playlists.forEach((pl) => {
      const clone = document.importNode(
        document.getElementById("cardTmpl").content,
        true
      );
      const card = clone.querySelector(".card");
      card.dataset.id = pl.id;
      card.dataset.type = "playlist";
      card.addEventListener("click", () => openEntity("playlist", pl.id));

      clone.querySelector(".card__cover img").src = pl.cover;
      clone.querySelector(".card__title").textContent = pl.title;
      clone.querySelector(".card__info").textContent = `${pl.nb_tracks} треков`;
      playlistsRow.appendChild(clone);
    });
  }

  trackList.addEventListener("click", (e) => {
    const trackEl = e.target.closest(".track");
    if (!trackEl) return;
    const id = Number(trackEl.dataset.id);
    const tr = data.tracks.find((t) => t.id === id);
    if (!tr) return;
    loadTrackInPlayer(
      `/public/audio/${id}.mp3`,
      tr.cover,
      tr.title,
      tr.artists
    );
    updateNowPlaying(tr.title, tr.artists, tr.cover, tr.album || "Сингл");
  });

  center.appendChild(p);
}
