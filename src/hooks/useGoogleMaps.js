import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

let loaderInstance = null;

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in .env.local");
      return;
    }

    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey,
        version: "beta",
        libraries: ["places", "geocoding"],
      });
    }

    loaderInstance
      .load()
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err.message));
  }, []);

  return { isLoaded, error };
}

export function getLoader() {
  return loaderInstance;
}
