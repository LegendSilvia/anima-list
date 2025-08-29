"use client";

import { useState, useEffect } from "react";
import AnimeCard from "../../components/animeCard";

function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1–12
  if ([1, 2, 3].includes(month)) return "winter";
  if ([4, 5, 6].includes(month)) return "spring";
  if ([7, 8, 9].includes(month)) return "summer";
  return "fall";
}

const currentYear = new Date().getFullYear();
const currentSeason = getCurrentSeason();

const TYPES = ["all", "tv", "ova", "movie", "special", "ona", "music"];

export default function Home() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const initialSeason = currentMonth <= 3
    ? "winter"
    : currentMonth <= 6
    ? "spring"
    : currentMonth <= 9
    ? "summer"
    : "fall";

  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState(initialSeason);
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

    // rating and type filter seems to not work on seasonal endpoint
  const [type, setType] = useState("all");
  const [rating, setRating] = useState("all");

  useEffect(() => {
    async function fetchAnime() {
      let url = new URL(`https://api.jikan.moe/v4/seasons/${year}/${season}?sfw`);
      const params = new URLSearchParams({ page, sfw: "true", limit: "24" });

      url.search = params.toString();

      try {
        const res = await fetch(url);
        const json = await res.json();
        setAnimeList(json.data ?? []);
        setHasNextPage(json.pagination?.has_next_page ?? false);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchAnime();
  }, [year, season, page]);

  return (
    <div className="p-4 space-y-6">
      {/* Section 1: Filters */}
      <section className="bg-gray-700 text-white rounded-lg p-4 shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Year</label>
          <select
            value={year}
            onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
            className="p-2 rounded text-black w-full"
          >
            {Array.from({ length: 25 }, (_, i) => currentYear - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Season</label>
          <select
            value={season}
            onChange={(e) => { setSeason(e.target.value); setPage(1); }}
            className="p-2 rounded text-black w-full"
          >
            {["winter", "spring", "summer", "fall"].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        {/* Seem like jikan only allowed type to work on top anime only */}
        {/* <div>
          <label className="block mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="p-2 rounded text-black w-full"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div> */}
      </section>

      {/* Section 2: Anime Grid + Pagination */}
      <section className="bg-gray-800 text-white rounded-lg p-6 shadow min-h-[400px]">
        <h2 className="text-xl font-bold mb-4">
          Anime List:ㅤ {season.charAt(0).toUpperCase() + season.slice(1)} {year}ㅤ
          {type !== "all" && ` • ${type.toUpperCase()}`}
          {rating !== "all" && ` • Rating: ${rating.toUpperCase()}`}
           • ㅤPage {page}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={!hasNextPage}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-gray-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
