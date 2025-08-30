"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AnimeCard from "./../components/animeCard";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "lucide-react";

const SEASONS = ["winter", "spring", "summer", "fall"];

export default function Home() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const initialSeason =
    currentMonth <= 3
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
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);

  // Correctly initialize and persist the cache using useRef
  const animeCacheRef = useRef({});

  const fetchAnimeWithCache = useCallback(async (year, season, page) => {
    const cacheKey = `${year}-${season}-${page}`;
    // Access the cache using .current
    if (animeCacheRef.current[cacheKey]) {
      return animeCacheRef.current[cacheKey];
    }
    const url = new URL(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
    const params = new URLSearchParams({ page, sfw: "true", limit: "25" });
    url.search = params.toString();

    try {
      const res = await fetch(url);
      const json = await res.json();
      const rawData = json.data ?? [];
      const hasNextPage = json.pagination?.has_next_page ?? false;
      const result = { data: rawData, hasNextPage };
      // Store the result in the cache
      animeCacheRef.current[cacheKey] = result;
      return result;
    } catch (err) {
      console.error("Fetch error:", err);
      return { data: [], hasNextPage: false };
    }
  }, []); // No dependencies are needed since useRef provides a stable reference

  useEffect(() => {
    const getAnime = async () => {
      setLoading(true);
      const { data, hasNextPage } = await fetchAnimeWithCache(year, season, page);
      setAnimeList(data);
      setHasNextPage(hasNextPage);
      setLoading(false);
    };
    getAnime();
  }, [year, season, page, fetchAnimeWithCache]);

  const handleSeasonChange = (direction) => {
    const currentIndex = SEASONS.indexOf(season);
    const newIndex = (currentIndex + direction + SEASONS.length) % SEASONS.length;
    const newSeason = SEASONS[newIndex];

    let newYear = year;
    if (direction === 1 && newSeason === "winter") {
      newYear += 1;
    } else if (direction === -1 && newSeason === "fall") {
      newYear -= 1;
    }

    setYear(newYear);
    setSeason(newSeason);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gray-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <button
            onClick={() => handleSeasonChange(-1)}
            className="p-3 transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Previous Season"
          >
            <ArrowLeftCircleIcon className="w-8 h-8 text-blue-500" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-base text-gray-400 font-light hidden sm:block">
              {season.charAt(0).toUpperCase() + season.slice(1)} {year}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-wide mt-1">
              {season.charAt(0).toUpperCase() + season.slice(1)} {year} Anime
            </h1>
          </div>
          <button
            onClick={() => handleSeasonChange(1)}
            className="p-3 transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="Next Season"
          >
            <ArrowRightCircleIcon className="w-8 h-8 text-blue-500" />
          </button>
        </section>
        <section className="bg-gray-800 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center flex-grow text-2xl text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] gap-6 p-4">
              {animeList.length > 0 ? (
                animeList.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center h-full text-2xl text-gray-400">
                  No anime found for this season.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-6 py-3 bg-gray-700 text-white rounded-full font-bold shadow-md transition-all duration-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md transition-all duration-200 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}