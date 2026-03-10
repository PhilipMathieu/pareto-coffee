import React, { useState, useCallback } from "react";
import AddressInput from "./components/AddressInput.jsx";
import CategoryToggles from "./components/CategoryToggles.jsx";
import RadiusControl from "./components/RadiusControl.jsx";
import MapView from "./components/MapView.jsx";
import ScatterPlot from "./components/ScatterPlot.jsx";
import ShopList from "./components/ShopList.jsx";
import { useGoogleMaps } from "./hooks/useGoogleMaps.js";
import { runPlacesSearch } from "./hooks/usePlacesSearch.js";
import { getWalkingRoute } from "./hooks/useOSRM.js";
import { paretoFrontier } from "./lib/pareto.js";
import { CATEGORIES } from "./lib/categories.js";

export default function App() {
  const { isLoaded: mapsLoaded, error: mapsError } = useGoogleMaps();

  const [origin, setOrigin] = useState(null);
  const [maxDistance, setMaxDistance] = useState(1000);
  const [categories, setCategories] = useState(CATEGORIES);
  const [minReviews] = useState(5);

  const [allShops, setAllShops] = useState([]);
  const [frontierShops, setFrontierShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [walkingRoute, setWalkingRoute] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const frontierIds = new Set(frontierShops.map((s) => s.id));

  const handleSearch = useCallback(
    async (address) => {
      if (!mapsLoaded) {
        setError("Google Maps is not loaded yet.");
        return;
      }
      setLoading(true);
      setError(null);
      setAllShops([]);
      setFrontierShops([]);
      setSelectedShopId(null);
      setWalkingRoute(null);

      try {
        // Geocode address with timeout
        const { Geocoder } = await window.google.maps.importLibrary("geocoding");
        const geocoder = new Geocoder();

        const geocodeWithTimeout = () => {
          return Promise.race([
            geocoder.geocode({ address }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Geocoding timed out. The API key may not be authorized for this domain.")), 10000)
            )
          ]);
        };

        const { results } = await geocodeWithTimeout();

        if (!results || results.length === 0) {
          setError("Couldn't find that address. Try being more specific.");
          return;
        }

        const loc = results[0].geometry.location;
        const newOrigin = { lat: loc.lat(), lng: loc.lng() };
        setOrigin(newOrigin);

        // Search places
        const shops = await runPlacesSearch({
          origin: newOrigin,
          maxDistance,
          categories,
          minReviews,
        });

        if (shops.length === 0) {
          setError(
            `No coffee shops found within ${maxDistance}m. Try increasing the radius or lowering the minimum reviews.`
          );
          return;
        }

        const frontier = paretoFrontier(shops);
        const frontierIdSet = new Set(frontier.map((s) => s.id));
        const shopsWithFrontier = shops.map((s) => ({
          ...s,
          isOnFrontier: frontierIdSet.has(s.id),
        }));

        setAllShops(shopsWithFrontier);
        setFrontierShops(frontier);
      } catch (err) {
        console.error(err);
        if (err.message?.includes("REQUEST_DENIED") || err.message?.includes("InvalidValueError")) {
          setError("Invalid API key or API not enabled. Check your Google Cloud Console settings.");
        } else if (err.message?.includes("OVER_QUERY_LIMIT")) {
          setError("API quota exceeded. Please try again later.");
        } else if (err.message?.includes("RefererNotAllowed") || err.code === "RefererNotAllowedMapError") {
          setError("Your domain is not authorized for this API key. Add your URL to allowed referrers in Google Cloud Console.");
        } else if (err.message?.includes("timed out")) {
          setError("Request timed out. The API key may not be properly configured.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [mapsLoaded, maxDistance, categories, minReviews]
  );

  const handleShopClick = useCallback(
    async (shopId) => {
      setSelectedShopId(shopId);
      setWalkingRoute(null);

      if (!origin) return;
      const shop = allShops.find((s) => s.id === shopId);
      if (!shop) return;

      const route = await getWalkingRoute(origin, shop.location);
      setWalkingRoute(route ? route.geometry : null);
    },
    [origin, allShops]
  );

  const handleCategoryChange = (key, enabled) => {
    setCategories((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-amber-700 text-white px-4 py-3 shadow-md">
        <h1 className="text-xl font-bold tracking-tight">☕ Pareto Coffee</h1>
        <p className="text-amber-200 text-xs mt-0.5">
          Find the best coffee shops on the Pareto frontier
        </p>
      </header>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="flex flex-wrap gap-3 items-center">
            <AddressInput onSearch={handleSearch} loading={loading} />
            <RadiusControl value={maxDistance} onChange={setMaxDistance} />
          </div>
          <CategoryToggles categories={categories} onChange={handleCategoryChange} />
        </div>
      </div>

      {/* Error / info banners */}
      {mapsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
          ⚠️ {mapsError}
        </div>
      )}
      {error && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Map + Chart row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 400 }}>
            <MapView
              origin={origin}
              shops={allShops}
              frontierIds={frontierIds}
              selectedShopId={selectedShopId}
              walkingRoute={walkingRoute}
              onShopClick={handleShopClick}
            />
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 400 }}>
            {allShops.length > 0 ? (
              <ScatterPlot
                shops={allShops}
                frontierIds={frontierIds}
                selectedShopId={selectedShopId}
                onShopClick={handleShopClick}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                {loading
                  ? "Searching for coffee shops..."
                  : "Search for coffee shops to see the Pareto scatter plot"}
              </div>
            )}
          </div>
        </div>

        {/* Shop list */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm">
              Results{" "}
              {allShops.length > 0 && (
                <span className="text-gray-400 font-normal">
                  ({allShops.length} shops, {frontierShops.length} on frontier)
                </span>
              )}
            </h2>
          </div>
          <ShopList
            shops={allShops}
            frontierIds={frontierIds}
            selectedShopId={selectedShopId}
            onShopClick={handleShopClick}
          />
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-3">
        Pareto Coffee — powered by Google Places & MapLibre GL
      </footer>
    </div>
  );
}
