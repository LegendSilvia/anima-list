"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AnimeCard from "./../../components/animeCard";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
  SearchIcon,
  FilterIcon,
} from "lucide-react";

// The full API documentation is provided by the user in the image.
// We will use the available filters from that image.
const ANIME_TYPES = ["tv", "ova", "special", "ona", "music", "movie"];
const ANIME_STATUSES = ["airing", "complete", "upcoming"];
const ANIME_RATINGS = ["g", "pg", "pg13", "r17", "r", "rx"];
const ANIME_SORTS = [
  "title",
  "start_date",
  "end_date",
  "episodes",
  "score",
  "scored_by",
  "rank",
  "popularity",
  "members",
  "favorites",
];

// Correctly map API ratings to human-readable text
const RATING_LABELS = {
  g: "G - All Ages",
  pg: "PG - Children",
  pg13: "PG-13+ - Teens 13 or older",
  r17: "R - 17+ (Violence & profanity)",
  r: "R+ - Mild Nudity",
  // rx: "Rx - Hentai (Not Safe For Work)",
};

// Correctly map API sorts to human-readable text
const SORT_LABELS = {
  title: "Title",
  start_date: "Newest",
  end_date: "End Date",
  episodes: "Episodes",
  score: "Score",
  scored_by: "Scored By",
  rank: "Rank",
  popularity: "Popularity",
  members: "Members",
  favorites: "Favorites",
};

export default function Home() {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    rating: "",
    sort: "start_date", // Default sort by newest
    sfw: true, // safe for work is true by default
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Correctly initialize and persist the cache using useRef
  const animeCacheRef = useRef({});

  const fetchAnimeWithCache = useCallback(
    async (query, page, filters) => {
      const cacheKey = `${query}-${page}-${JSON.stringify(filters)}`;
      // Access the cache using .current
      if (animeCacheRef.current[cacheKey]) {
        return animeCacheRef.current[cacheKey];
      }

      const url = new URL("https://api.jikan.moe/v4/anime");
      const params = new URLSearchParams({ limit: 24, page, sfw: "true", order_by: filters.sort, sort: "desc" });

      if (query) {
        params.append("q", query);
      }
      if (filters.type) {
        params.append("type", filters.type);
      }
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.rating) {
        params.append("rating", filters.rating);
      }

      // If rating is 'rx', set sfw to false
      if (filters.rating === "rx") {
        params.set("sfw", "false");
      } else if (filters.sfw) {
        params.set("sfw", "true");
      }

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
    },
    []
  );

  useEffect(() => {
    const getAnime = async () => {
      setLoading(true);
      const { data, hasNextPage } = await fetchAnimeWithCache(
        appliedSearchQuery,
        page,
        filters
      );

      // De-duplication logic
      const seenIds = new Set();
      const uniqueAnimeList = data.filter((anime) => {
        if (seenIds.has(anime.mal_id)) {
          return false;
        } else {
          seenIds.add(anime.mal_id);
          return true;
        }
      });

      setAnimeList(uniqueAnimeList);
      setHasNextPage(hasNextPage);
      setLoading(false);
    };
    getAnime();
  }, [appliedSearchQuery, page, filters, fetchAnimeWithCache]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
    setPage(1); // Reset to page 1 for new search
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setPage(1); // Reset to page 1 when filters change
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search for anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>
          </div>
          <button
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-md transition-all duration-200 hover:bg-blue-500"
          >
            <FilterIcon className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </section>

        {isFilterMenuOpen && (
          <section className="bg-gray-800 rounded-2xl p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-fadeIn">
            <div>
              <label className="block text-gray-300 font-bold mb-2">Type</label>
              <select
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                {ANIME_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-2">Status</label>
              <select
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                {ANIME_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-2">Rating</label>
              <select
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
              >
                <option value="">All Ratings</option>
                {ANIME_RATINGS.map((rating) => (
                  <option key={rating} value={rating}>
                    {RATING_LABELS[rating]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-bold mb-2">Sort By</label>
              <select
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                {ANIME_SORTS.map((sort) => (
                  <option key={sort} value={sort}>
                    {SORT_LABELS[sort]}
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

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
                  No anime found. Try a different search or filter.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer px-6 py-3 bg-gray-700 text-white rounded-full font-bold shadow-md transition-all duration-200 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={!hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
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