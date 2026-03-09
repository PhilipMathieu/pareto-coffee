/**
 * Fetch a walking route from OSRM public server.
 * Returns null on failure (silent degradation).
 */
export async function getWalkingRoute(origin, destination) {
  try {
    const url = `https://router.project-osrm.org/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.code !== "Ok" || !data.routes || !data.routes.length) return null;

    return {
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      geometry: data.routes[0].geometry,
    };
  } catch {
    return null;
  }
}
