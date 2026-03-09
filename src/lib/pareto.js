/**
 * Compute the Pareto frontier for shops.
 * Minimizes distance, maximizes rating.
 *
 * @param {Array<{id: string, distance: number, rating: number}>} shops
 * @returns {Array} Subset of shops on the Pareto frontier
 */
export function paretoFrontier(shops) {
  if (!shops || shops.length === 0) return [];

  // Sort by distance ascending
  const sorted = [...shops].sort((a, b) => a.distance - b.distance);
  const frontier = [];
  let bestRating = -Infinity;

  for (const shop of sorted) {
    if (shop.rating > bestRating) {
      frontier.push(shop);
      bestRating = shop.rating;
    }
  }

  return frontier;
}
