'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function AnimeCard({ anime }) {
    const imageUrl = anime.images?.jpg?.large_image_url;
    const imageUrlSmall = anime.images?.jpg?.small_image_url;
    const title = anime.title;
    const episodes = anime.episodes;
    const score = anime.score;
    const users = anime.members;
    const rank = anime.rank;
    const genres = anime.genres;
    const rating = anime.rating;
    const status = anime.status;
    const type = anime.type;
    const animeId = anime.mal_id;

    // State to manage if the anime is in the watchlist
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    // State to manage the current watch status of the anime
    const [currentStatus, setCurrentStatus] = useState('plan to watch');

    // Check on component load if the anime is already in the cookie
    useEffect(() => {
        const watchlist = Cookies.get('watchlist');
        if (watchlist) {
            const parsedWatchlist = JSON.parse(watchlist);
            const foundAnime = parsedWatchlist.find(item => item.id === animeId);
            if (foundAnime) {
                setIsInWatchlist(true);
                setCurrentStatus(foundAnime.watch_status);
            }
        }
    }, [animeId]);

    if (!anime || !imageUrl) {
        return null;
    }

    const visibleGenres = genres?.slice(0, 3) || [];
    const remainingGenresCount = (genres?.length || 0) - visibleGenres.length;

    const handleAddToWatchlist = () => {
        const watchlist = Cookies.get('watchlist');
        let newWatchlist = watchlist ? JSON.parse(watchlist) : [];

        // Determine the initial watch status
        const initialWatchStatus = (status === "Not yet aired") ? "plan to watch" : "watching";

        // Set episodes based on the chosen status
        const startingEpisodes = (initialWatchStatus === "plan to watch") ? 0 : 1;

        const newAnime = {
            id: animeId,
            title: title,
            imageUrl: imageUrl,
            watch_status: initialWatchStatus,
            episodes: startingEpisodes,
            total_episodes: episodes || 0, // falls back to 0 if unknown
        };

        const isAlreadyInList = newWatchlist.some(item => item.id === newAnime.id);

        if (!isAlreadyInList) {
            newWatchlist.push(newAnime);
            Cookies.set("watchlist", JSON.stringify(newWatchlist), { expires: 365 });
            setIsInWatchlist(true);
            setCurrentStatus(initialWatchStatus);
            console.log(`Added ${title} to watchlist with status: ${initialWatchStatus}`);
        } else {
            console.log(`${title} is already in the watchlist`);
        }
    };


    const handleUpdateWatchStatus = (newStatus) => {
        const watchlist = Cookies.get('watchlist');
        if (watchlist) {
            let parsedWatchlist = JSON.parse(watchlist);

            if (newStatus === 'remove') {
                parsedWatchlist = parsedWatchlist.filter(item => item.id !== animeId);
                // Update component state to reflect removal
                setIsInWatchlist(false);
                setCurrentStatus('plan to watch');
                console.log(`Removed anime with ID ${animeId} from the watchlist`);
            } else {
                parsedWatchlist = parsedWatchlist.map(item =>
                    item.id === animeId ? { ...item, watch_status: newStatus } : item
                );
                // Update component state to reflect new status
                setCurrentStatus(newStatus);
                console.log(`Updated anime with ID ${animeId} status to ${newStatus}`);
            }

            Cookies.set('watchlist', JSON.stringify(parsedWatchlist), { expires: 365 });
        }
    };

    // Helper function to format the status string
    const formatStatus = (statusString) => {
        if (!statusString) return '';
        const words = statusString.split(' ');
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div key={animeId} className="relative w-full sm:w-52 md:w-96 h-162 bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
            <div className="relative w-full h-2/3 sm:h-3/4">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-bold rounded-full">
                    {rating ? rating : "N/A"}
                </div>
                <div className="absolute top-2 left-2 px-2 py-1 bg-gray-700 bg-opacity-70 text-white text-xs font-bold rounded-full">
                    {type}
                </div>
                {/* Conditional rendering for the button/dropdown */}
                {isInWatchlist ? (
                    <div className="absolute top-2 right-2 group z-50">
                        <button
                            className={`px-2 py-1 border rounded-full text-white text-xs font-bold rounded-full cursor-pointer hover:scale-105 transition-colors duration-300
        ${currentStatus === 'watching' ? 'bg-green-500 border-green-700 hover:bg-green-700' :
                                    currentStatus === 'dropped' ? 'bg-red-500 border-red-700 hover:bg-red-700' :
                                        currentStatus === 'on hold' ? 'bg-yellow-500 border-yellow-700 hover:bg-yellow-700' :
                                            currentStatus === 'completed' ? 'bg-blue-500 border-blue-700 hover:bg-blue-700' :
                                                'bg-gray-500 border-gray-700 hover:bg-gray-700'}`
                            }
                            title="In Watchlist"
                        >
                            {formatStatus(currentStatus)} ▼
                        </button>
                        <div className="absolute mt-2 w-25 bg-gray-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                            <ul className="py-1">
                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus('plan to watch')}>Plan to Watch</li>
                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus('watching')}>Watching</li>
                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus('completed')}>Completed</li>
                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus('on hold')}>On Hold</li>
                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus('dropped')}>Dropped</li>
                                <li className="px-4 py-2 text-sm text-red-400 hover:bg-red-900 cursor-pointer" onClick={() => handleUpdateWatchStatus('remove')}>Remove</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div
                        className="absolute top-2 right-2 px-2 py-1 bg-blue-200 border rounded-full border-blue-600 hover:text-white hover:scale-105 hover:bg-blue-600 text-blue-600 text-xs font-bold rounded-full cursor-pointer"
                        onClick={handleAddToWatchlist}
                        title="Add to Watchlist"
                    >
                        Add To List
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col justify-between h-1/2 sm:h-1/3 text-white">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span
                            className={`text-xs font-semibold px-2 py-1 border rounded-full
                                ${status === "Currently Airing"
                                    ? "text-green-500 border-green-500"
                                    : status === "Not yet aired"
                                        ? "text-yellow-500 border-yellow-500"
                                        : "text-blue-500 border-blue-500"
                                }`}
                        >
                            {status}
                        </span>
                        <span className="text-xs text-gray-400">
                            {episodes ? `${episodes} episodes` : "N/A episodes"}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 whitespace-nowrap overflow-hidden overflow-ellipsis" title={title}>
                        {title}
                    </h3>

                    <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center text-sm">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1 font-semibold">{score?.toFixed(2)}</span>
                            <span className="text-xs text-gray-400 ml-1">({users?.toLocaleString()} users)</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            <span className="font-semibold">#{rank}</span> Ranking
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {visibleGenres.map((genre) => (
                            <span key={genre.mal_id} className="px-2 py-1 text-xs font-semibold bg-gray-700 rounded-full">
                                {genre.name}
                            </span>
                        ))}
                        {remainingGenresCount > 0 && (
                            <span className="px-2 py-1 text-xs font-semibold bg-gray-700 rounded-full">
                                +{remainingGenresCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}