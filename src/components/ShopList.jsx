import React, { useRef, useEffect } from "react";
import { walkingMinutes } from "../lib/geo.js";

export default function ShopList({ shops, frontierIds, selectedShopId, onShopClick, onHide }) {
  const listRef = useRef(null);
  const selectedRef = useRef(null);

  useEffect(() => {
    if (selectedRef.current && listRef.current) {
      selectedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedShopId]);

  const sorted = [...shops].sort((a, b) => {
    const aFrontier = frontierIds.has(a.id) ? 0 : 1;
    const bFrontier = frontierIds.has(b.id) ? 0 : 1;
    if (aFrontier !== bFrontier) return aFrontier - bFrontier;
    return a.distance - b.distance;
  });

  if (sorted.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 text-sm">
        No results yet. Enter an address and click Search.
      </div>
    );
  }

  return (
    <div ref={listRef} className="overflow-y-auto max-h-64 divide-y divide-gray-100">
      {sorted.map((shop) => {
        const isFrontier = frontierIds.has(shop.id);
        const isSelected = shop.id === selectedShopId;
        return (
          <div
            key={shop.id}
            ref={isSelected ? selectedRef : null}
            onClick={() => onShopClick(shop.id)}
            className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors text-sm ${
              isSelected
                ? "bg-amber-50 border-l-2 border-amber-500"
                : "hover:bg-gray-50"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex-shrink-0 border-2 border-white shadow-sm ${
                isFrontier ? "bg-amber-500" : "bg-gray-300"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{shop.name}</span>
                {isFrontier && (
                  <span className="text-amber-600 text-xs font-bold flex-shrink-0">✦</span>
                )}
              </div>
              <div className="text-gray-500 text-xs">
                ⭐ {shop.rating} ({shop.userRatingCount} reviews) · ~{Math.round(shop.distance)}m
                (~{walkingMinutes(shop.distance)} min walk)
              </div>
            </div>
            {onHide && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHide(shop.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                title="Hide this place"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      })}
      <div className="text-xs text-gray-400 px-3 py-1.5">✦ = Pareto-optimal</div>
    </div>
  );
}
