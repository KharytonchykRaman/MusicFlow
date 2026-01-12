import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import fetch from "node-fetch";
import { Track, Artist } from "./models/index.js";

const OUT_DIR = "./public/audio";
await mkdir(OUT_DIR, { recursive: true });

const tracks = await Track.findAll({
  include: [
    {
      model: Artist,
      as: "artists",
    },
  ],
});

for (const tr of tracks) {
  try {
    const artistStr = tr.artists.map((a) => a.name).join(", ");
    const q = encodeURIComponent(`${artistStr} ${tr.title}`);
    const res = await fetch(`https://api.deezer.com/search?q=${q}&limit=1`);
    const data = await res.json();

    if (!data.data?.length) {
      console.warn("❌ не найден:", tr.title);
      continue;
    }

    const previewUrl = data.data[0].preview;
    const fileName = `${tr.id}.mp3`;
    const outPath = `${OUT_DIR}/${fileName}`;

    await pipeline((await fetch(previewUrl)).body, createWriteStream(outPath));

    console.log("✅", tr.id, fileName);
  } catch (e) {
    console.error("⚠️", tr.id, e.message);
  }  
}
console.log("Готово!");
