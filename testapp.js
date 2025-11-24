const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Загружаем треки
let tracks = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data.json"), "utf8")
);

// Endpoint 1: Получить треки
app.get("/tracks", (req, res) => {
  const { limit = 10, artist } = req.query;

  let filtered = tracks;
  if (artist) {
    filtered = tracks.filter((t) =>
      t.artist.toLowerCase().includes(artist.toLowerCase())
    );
  }

  const result = filtered.slice(0, parseInt(limit));
  res.json({ status: "success", result });
});

// Статическая страница для прослушивания
app.get("/", (req, res) => {
  let result = `<h1>🎧 MusicFlow Backend</h1>
    <p>Работает с ${tracks.length} треками из Deezer API.</p>
    <ul>
      <li><a href="/tracks?limit=5">GET /tracks?limit=5</a></li>
    </ul>
    <h2>Пример плеера:</h2>`;

  tracks.forEach((track) => {
    result += `<audio controls src="${track.preview_url}"></audio>
    <p><em>${track.name} — ${track.artist}</em></p>`;
  });
  res.send(result);
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
  console.log(`   Загружено треков: ${tracks.length}`);
});
