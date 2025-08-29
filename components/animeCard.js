import React from 'react';

export default function AnimeCard({ anime }) {
    const imageUrl = anime.images?.jpg?.image_url;
    const title = anime.title;
    const episodes = anime.episodes;
    const score = anime.score;
    const users = anime.members;
    const rank = anime.rank;
    const genres = anime.genres;
    const rating = anime.rating;
    const status = anime.status;

    if (!anime || !imageUrl) {
        return null;
    }

    const visibleGenres = genres?.slice(0, 3) || [];
    const remainingGenresCount = (genres?.length || 0) - visibleGenres.length;

    return (
        <div key={anime.mal_id} className="relative w-72 h-120 bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
            <div className="relative w-full h-2/3">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-bold rounded-full">
                    {rating}
                </div>
            </div>

            <div className="p-4 flex flex-col justify-between h-1/3 text-white">
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
                        <span className="text-xs text-gray-400">{episodes} episodes</span>
                    </div>

                    {/* Shortened Title */}
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