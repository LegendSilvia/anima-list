'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function YourList() {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [editingEpisodeId, setEditingEpisodeId] = useState(null);

    // Color mapping for each watch status
    const statusColors = {
        'watching': 'border-green-500',
        'on hold': 'border-yellow-500',
        'dropped': 'border-red-500',
        'completed': 'border-blue-500',
        'plan to watch': 'border-gray-500'
    };

    const statusHeadings = {
        'watching': 'Currently Watching',
        'on hold': 'On Hold',
        'dropped': 'Dropped',
        'completed': 'Completed',
        'plan to watch': 'Plan to Watch'
    };

    // Load watchlist from cookie on component mount
    useEffect(() => {
        try {
            const storedWatchlist = Cookies.get('watchlist');
            if (storedWatchlist) {
                // Ensure each item has a currentEpisode and mock a totalEpisodes count for display
                const parsedWatchlist = JSON.parse(storedWatchlist).map(item => ({
                    ...item,
                    currentEpisode: item.currentEpisode !== undefined ? item.currentEpisode : 0,
                    totalEpisodes: item.totalEpisodes || 12, // Mocking a total episode count for display
                }));
                setWatchlist(parsedWatchlist);
            }
        } catch (e) {
            console.error("Failed to parse watchlist from cookie:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to update watch status or remove an anime
    const handleUpdateWatchStatus = (animeId, newStatus) => {
        let newWatchlist = watchlist;
        if (newStatus === 'remove') {
            newWatchlist = watchlist.filter(item => item.id !== animeId);
        } else {
            newWatchlist = watchlist.map(item =>
                item.id === animeId ? { ...item, watch_status: newStatus } : item
            );
        }
        setWatchlist(newWatchlist);
        Cookies.set('watchlist', JSON.stringify(newWatchlist), { expires: 365 });
        setOpenDropdownId(null);
    };

    // Function to update episode count and cookie
    const handleUpdateEpisode = (animeId, newEpisodeCount) => {
        const newWatchlist = watchlist.map(item => {
            if (item.id === animeId) {
                const updatedEpisode = Math.max(0, parseInt(newEpisodeCount, 10) || 0);
                return { ...item, currentEpisode: updatedEpisode };
            }
            return item;
        });
        setWatchlist(newWatchlist);
        Cookies.set('watchlist', JSON.stringify(newWatchlist), { expires: 365 });
    };

    // Helper to format watch status string
    const formatStatus = (statusString) => {
        if (!statusString) return '';
        const words = statusString.split(' ');
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Group anime by watch status
    const groupedAnime = watchlist.reduce((acc, anime) => {
        const status = anime.watch_status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(anime);
        return acc;
    }, {});

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white font-sans p-6 flex justify-center items-center">Loading your list...</div>;
    }

    if (watchlist.length === 0) {
        return <div className="min-h-screen bg-gray-900 text-white font-sans p-6 flex justify-center items-center text-center">Your watchlist is empty. Add some anime to get started!</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <section className="bg-gray-800 rounded-2xl p-6 shadow-xl flex items-center justify-center">
                    <h1 className="text-3xl font-bold">Your Anime Watchlist</h1>
                </section>
                {Object.keys(statusHeadings).map(status => {
                    const animeList = groupedAnime[status];
                    if (animeList && animeList.length > 0) {
                        return (
                            <section key={status} className="bg-gray-800 rounded-2xl p-6 shadow-xl">
                                <h2 className="text-2xl font-bold mb-4">{statusHeadings[status]}</h2>
                                <div className="space-y-4">
                                    {animeList.map(anime => (
                                        <div key={anime.id} className={`flex items-center p-4 bg-gray-700 rounded-lg shadow-lg border-l-4 ${statusColors[anime.watch_status] || 'border-gray-500'}`}>
                                            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 mr-4">
                                                <img src={anime.imageUrl} alt={anime.title} className="w-full h-full object-cover rounded-md" />
                                            </div>
                                            <div className="flex-grow flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-bold line-clamp-2">{anime.title}</h3>
                                                    <div className="relative ml-4">
                                                        <button
                                                            onClick={() => setOpenDropdownId(openDropdownId === anime.id ? null : anime.id)}
                                                            className="px-3 py-1 bg-gray-600 rounded-full text-xs font-bold hover:bg-gray-500"
                                                        >
                                                            Edit - More ▼
                                                        </button>
                                                        {openDropdownId === anime.id && (
                                                            <ul className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg z-10">
                                                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer rounded-t-lg" onClick={() => handleUpdateWatchStatus(anime.id, 'watching')}>Watching</li>
                                                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus(anime.id, 'completed')}>Completed</li>
                                                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus(anime.id, 'on hold')}>On Hold</li>
                                                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus(anime.id, 'dropped')}>Dropped</li>
                                                                <li className="px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer" onClick={() => handleUpdateWatchStatus(anime.id, 'plan to watch')}>Plan to Watch</li>
                                                                <li className="px-4 py-2 text-sm text-red-400 hover:bg-red-900 cursor-pointer rounded-b-lg" onClick={() => handleUpdateWatchStatus(anime.id, 'remove')}>Remove</li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-sm text-gray-400 mr-2">Status:</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColors[anime.watch_status]}`}>{formatStatus(anime.watch_status)}</span>
                                                </div>
                                                <div className="mt-2 flex items-center">
                                                    {editingEpisodeId === anime.id ? (
                                                        <div className="flex items-center space-x-2">
                                                            <input
                                                                type="number"
                                                                value={anime.currentEpisode}
                                                                onChange={(e) => handleUpdateEpisode(anime.id, e.target.value)}
                                                                onBlur={() => setEditingEpisodeId(null)}
                                                                className="w-16 bg-gray-900 text-white rounded px-2 py-1 text-sm focus:outline-none"
                                                            />
                                                            <span className="text-sm">/ {anime.totalEpisodes}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <span className="text-lg font-semibold cursor-pointer" onClick={() => setEditingEpisodeId(anime.id)}>
                                                                {anime.currentEpisode} / {anime.totalEpisodes}
                                                            </span>
                                                            <button onClick={() => setEditingEpisodeId(anime.id)} className="ml-2 text-xs font-bold text-blue-400 hover:text-blue-200">
                                                                Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }
                    return null; // Return null for statuses with no anime
                })}
            </div>
        </div>
    );
}