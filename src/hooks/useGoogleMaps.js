import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

let loaderInstance = null;

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your .env file.");
      return;
    }

    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey,
        version: "beta",
        libraries: ["places", "geocoding"],
      });
    }

    // Listen for Google Maps API errors (e.g., RefererNotAllowedMapError)
    const handleGoogleMapsError = (event) => {
      if (event.message?.includes("Google Maps") || event.message?.includes("RefererNotAllowed")) {
        setError("Your domain is not authorized for this API key. Add your URL to allowed referrers in Google Cloud Console.");
      }
    };
    window.addEventListener("error", handleGoogleMapsError);

    loaderInstance
      .load()
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err.message));

    return () => {
      window.removeEventListener("error", handleGoogleMapsError);
    };
  }, []);

  return { isLoaded, error };
}

export function getLoader() {
  return loaderInstance;
}
