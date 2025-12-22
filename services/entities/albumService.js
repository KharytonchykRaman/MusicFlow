const repository = require("../../data/repositories/albumRepository");

function toAlbumDTOCompact(raw) {
  return {
    id: raw.id,
    title: raw.title,
    cover: raw.cover,
    label: raw.label,
    nb_tracks: raw.nb_tracks,
    fans: raw.fans,
    release_date: raw.release_date,
    record_type: raw.record_type,
    genres: structuredClone(raw.genres),
    artists: structuredClone(raw.artists),
    type: raw.type,
  };
}

async function getPopularAlbums(limit = 10) {
  const rawAlbums = await repository.findAlbumsSortedByFans(limit);
  return rawAlbums.map((al) => toAlbumDTOCompact(al));
}

function sortByFans(albums) {
  const result = structuredClone(albums);

  result.sort((al1, al2) => al2.fans - al1.fans);

  return result;
}

async function getSearchedAlbums(q, limit) {
  const rawSearchedAlbums = await repository.findSearchedAlbums(q, limit);

  const albumsDTO = rawSearchedAlbums.map((al) => toAlbumDTOCompact(al));

  const sorted = sortByFans(albumsDTO);

  return sorted;
}

module.exports = {
  getSearchedAlbums,
  getPopularAlbums,
  sortByFans,
};
