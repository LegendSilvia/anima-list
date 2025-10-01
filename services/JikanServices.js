const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Simple in-memory cache for the server
const serverCache = {};
const CACHE_LIFETIME_MS = 10 * 60 * 1000; // 10 minutes

app.use(cors());

// Jikan Proxy Endpoint
app.get('/api/seasons/:year/:season', async (req, res) => {
    // Dynamically import node-fetch here
    const { default: fetch } = await import('node-fetch');

    const { year, season } = req.params;
    const page = req.query.page || '1';
    const limit = req.query.limit || '24';
    const sfw = req.query.sfw || 'true';

    const cacheKey = `${year}-${season}-${page}`;
    const now = Date.now();

    // Check server-side cache
    if (serverCache[cacheKey] && now < serverCache[cacheKey].expiry) {
        console.log(`[Cache] Serving ${cacheKey} from server cache.`);
        // The data is stored under .data in the cache object
        return res.json(serverCache[cacheKey].data); 
    }

    const jikanUrl = new URL(`https://api.jikan.moe/v4/seasons/${year}/${season}`);
    const params = new URLSearchParams({ page, sfw, limit });
    jikanUrl.search = params.toString();

    console.log(`[Fetch] Calling Jikan API for ${cacheKey}`);

    try {
        const response = await fetch(jikanUrl.toString());
        if (!response.ok) {
            throw new Error(`Jikan API responded with status ${response.status}`);
        }
        const json = await response.json();

        // Store result in server-side cache
        const cacheData = {
            data: json,
            expiry: now + CACHE_LIFETIME_MS
        };
        serverCache[cacheKey] = cacheData;

        res.json(json);
    } catch (error) {
        console.error("Error fetching from Jikan API:", error.message);
        res.status(500).json({ error: "Failed to fetch data from external API." });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Service running on http://localhost:${PORT}`);
});