import React from "react";

export default function CategoryToggles({ categories, onChange }) {
  return (
    <div className="flex gap-4 flex-wrap">
      {Object.entries(categories).map(([key, cat]) => (
        <label key={key} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cat.enabled}
            onChange={(e) => onChange(key, e.target.checked)}
            className="accent-amber-600"
          />
          <span>{cat.label}</span>
        </label>
      ))}
    </div>
  );
}
