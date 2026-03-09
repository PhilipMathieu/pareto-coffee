import React, { useState } from "react";

export default function AddressInput({ onSearch, loading }) {
  const [address, setAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 min-w-0">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Enter an address..."
        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !address.trim()}
        className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
