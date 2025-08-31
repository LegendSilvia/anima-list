"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AnimeCard from "./../../components/animeCard";
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from "lucide-react";

// Filter and sorting options based on Jikan API documentation
const FILTER_TYPES = ["tv", "movie", "ova", "special", "ona", "music"];
const FILTER_STATUS = ["airing", "complete", "upcoming"];
const ORDER_BY_OPTIONS = ["mal_id", "title", "type", "rating", "start_date", "end_date", "episodes", "score", "scored_by", "rank", "popularity", "members", "favorites"];
const SORT_OPTIONS = ["asc", "desc"];

export default function TopAnime() {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // State for filters and sorting
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [orderBy, setOrderBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("desc");

  // Correctly initialize and persist the cache using useRef
  const animeCacheRef = useRef({});

  const fetchTopAnimeWithCache = useCallback(async (page, type, status, orderBy, sortOrder) => {
    const cacheKey = `${page}-${type}-${status}-${orderBy}-${sortOrder}`;
    
    // Check cache first
    if (animeCacheRef.current[cacheKey]) {
      return animeCacheRef.current[cacheKey];
    }
    
    const url = new URL("https://api.jikan.moe/v4/top/anime");
    const params = new URLSearchParams({ 
      page, 
      sfw: "true", 
      limit: "24",
    });

    if (type) params.append("type", type);
    if (status) params.append("status", status);
    if (orderBy) params.append("order_by", orderBy);
    if (sortOrder) params.append("sort", sortOrder);
    
    url.search = params.toString();

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const getTopAnime = async () => {
      const { data, hasNextPage } = await fetchTopAnimeWithCache(page, filterType, filterStatus, orderBy, sortOrder);
      
      // De-duplication logic
      const seenIds = new Set();
      const uniqueAnimeList = data.filter(anime => {
        if (seenIds.has(anime.mal_id)) {
          console.warn(`Skipped duplicate anime with mal_id: ${anime.mal_id}`);
          return false;
        } else {
          seenIds.add(anime.mal_id);
          return true;
        }
      });

      setAnimeList(uniqueAnimeList);
      setHasNextPage(hasNextPage);
    };
    getTopAnime();
  }, [page, filterType, filterStatus, orderBy, sortOrder, fetchTopAnimeWithCache]);

  const handlePageChange = (direction) => {
    if (direction === -1 && page > 1) {
      setPage((p) => p - 1);
    } else if (direction === 1 && hasNextPage) {
      setPage((p) => p + 1);
    }
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1); // Reset to page 1 on filter/sort change
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-wide mt-1">
              Top Anime
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <label className="flex items-center gap-2">
              <span className="text-gray-400">Type:</span>
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(setFilterType, e.target.value)}
                className="bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {FILTER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-400">Order By:</span>
              <select
                value={orderBy}
                onChange={(e) => handleFilterChange(setOrderBy, e.target.value)}
                className="bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              >
                {ORDER_BY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-gray-400">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => handleFilterChange(setSortOrder, e.target.value)}
                className="bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
        <section className="bg-gray-800 rounded-2xl p-6 shadow-xl min-h-[500px] flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center flex-grow text-2xl text-gray-400">
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 p-4">
              {animeList.length > 0 ? (
                animeList.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center h-full text-2xl text-gray-400">
                  No anime found with these filters.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-4">
            <button
              disabled={page === 1 || loading}
              onClick={() => handlePageChange(-1)}
              className="cursor-pointer px-6 py-3 bg-gray-700 text-white rounded-full font-bold shadow-md transition-all duration-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={!hasNextPage || loading}
              onClick={() => handlePageChange(1)}
              className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md transition-all duration-200 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}