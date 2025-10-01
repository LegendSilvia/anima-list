// next.config.js
import withPWA from "next-pwa";

// Import the default Workbox runtime caching rules
// This is often needed to correctly cache Next.js's internal resources.
import defaultCache from "next-pwa/cache.js";

const nextConfig = {
  reactStrictMode: true,
  // Other Next.js configuration...
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 👈 Recommended: Disable PWA in dev
  
  // ------------------------------------------
  // 💡 Runtime Caching Configuration
  // ------------------------------------------
  runtimeCaching: [
    
    // 1. JSON Data Caching Rule (Your Local API Proxy)
    // Strategy: StaleWhileRevalidate (Serve cached data instantly, then check network for update)
    {
      // Adjust this URL to match your server's actual deployed endpoint later!
      urlPattern: ({ url }) => url.origin === 'http://localhost:4000' && url.pathname.startsWith('/api/seasons/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'anime-api-data',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 6 * 60 * 60, // 6 hours
        },
      },
    },

    // 2. External Image Caching Rule (Jikan/MAL CDN)
    // Strategy: CacheFirst (Serve image from cache immediately, only fetch if not found)
    {
      // Matches typical external anime image domains and file types
      urlPattern: /^https?:\/\/(cdn|myanimelist)\.net\/.*(\.jpg|\.png|\.webp)/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'jikan-anime-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200], // Important for cross-origin (CORS) images
        },
      },
    },
    
    // 3. Default Next-PWA Cache Rules (Keep these last)
    ...defaultCache,
  ],
  // ------------------------------------------
  
})(nextConfig);