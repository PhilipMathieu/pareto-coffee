import { haversine } from "../lib/geo.js";

const MAX_RADIUS = 3000; // meters

/**
 * Search for places using Google Places Text Search (New).
 * Paginates until exhausted or limit reached.
 */
async function searchPlaces(center, radiusM, textQuery) {
  const { Place } = await window.google.maps.importLibrary("places");

  const allPlaces = [];

  const request = {
    textQuery,
    locationRestriction: {
      circle: {
        center: { lat: center.lat, lng: center.lng },
        radius: radiusM,
      },
    },
    fields: [
      "id",
      "displayName",
      "location",
      "rating",
      "userRatingCount",
      "primaryType",
      "formattedAddress",
    ],
    pageSize: 20,
  };

  try {
    let response = await Place.searchByText(request);
    allPlaces.push(...(response.places || []));

    while (response.nextPageToken) {
      request.pageToken = response.nextPageToken;
      response = await Place.searchByText(request);
      allPlaces.push(...(response.places || []));
    }
  } catch (err) {
    console.error("Places search error:", err);
    throw err;
  }

  return allPlaces;
}

/**
 * Run text search for all enabled categories, deduplicate, compute distances,
 * and apply adaptive radius expansion if needed.
 */
export async function runPlacesSearch({
  origin,
  maxDistance,
  categories,
  minReviews,
}) {
  const searchRadius = maxDistance * 1.4;
  const enabledCategories = Object.entries(categories).filter(
    ([, cat]) => cat.enabled
  );

  const seenIds = new Set();
  let allResults = [];

  for (const [, cat] of enabledCategories) {
    let radius = searchRadius;
    let categoryResults = [];
    let attempts = 0;

    while (attempts < 3) {
      const rawPlaces = await searchPlaces(origin, radius, cat.query);

      // Filter by primaryType
      const filtered = rawPlaces.filter((p) =>
        cat.allowedPrimaryTypes.includes(p.primaryType)
      );

      // Compute haversine distance
      const withDistance = filtered.map((p) => ({
        id: p.id,
        name: p.displayName?.text || p.displayName || "Unknown",
        location: { lat: p.location.lat(), lng: p.location.lng() },
        rating: p.rating || 0,
        userRatingCount: p.userRatingCount || 0,
        primaryType: p.primaryType,
        formattedAddress: p.formattedAddress || "",
        distance: haversine(
          origin.lat,
          origin.lng,
          p.location.lat(),
          p.location.lng()
        ),
      }));

      // Filter by maxDistance
      categoryResults = withDistance.filter((p) => p.distance <= maxDistance);

      // Adaptive radius expansion
      if (categoryResults.length < 20 && radius < MAX_RADIUS) {
        radius = Math.min(radius * 1.5, MAX_RADIUS);
        attempts++;
      } else {
        break;
      }
    }

    // Deduplicate
    for (const place of categoryResults) {
      if (!seenIds.has(place.id)) {
        seenIds.add(place.id);
        allResults.push(place);
      }
    }
  }

  // Apply minimum review threshold
  allResults = allResults.filter((p) => p.userRatingCount >= minReviews);

  return allResults;
}
