import React from "react";

const RADIUS_OPTIONS = [500, 750, 1000, 1500, 2000, 3000, 4000, 5000];

export default function RadiusControl({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="radius-select" className="text-gray-700 whitespace-nowrap">
        Radius:
      </label>
      <select
        id="radius-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        {RADIUS_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {r >= 1000 ? `${r / 1000}km` : `${r}m`}
          </option>
        ))}
      </select>
    </div>
  );
}
