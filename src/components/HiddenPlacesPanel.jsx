import React, { useState } from "react";

export default function HiddenPlacesPanel({ hiddenShops, onUnhide, onClearAll }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (hiddenShops.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-100 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Hidden places ({hiddenShops.length})
        </span>
        {isExpanded && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClearAll();
            }}
            className="text-xs text-red-500 hover:text-red-700 hover:underline"
          >
            Clear all
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-1">
          {hiddenShops.map((shop) => (
            <div
              key={shop.id}
              className="flex items-center justify-between py-1.5 text-sm text-gray-600"
            >
              <span className="truncate">{shop.name}</span>
              <button
                onClick={() => onUnhide(shop.id)}
                className="text-xs text-amber-600 hover:text-amber-800 hover:underline ml-2 flex-shrink-0"
              >
                Unhide
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
