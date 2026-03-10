import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const TILE_STYLE =
  "https://tiles.openfreemap.org/styles/liberty";

export default function MapView({
  origin,
  shops,
  frontierIds,
  selectedShopId,
  walkingRoute,
  onShopClick,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(false);
  const originMarkerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: TILE_STYLE,
      zoom: 14,
      center: origin ? [origin.lng, origin.lat] : [-70.2553, 43.6615],
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update origin marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !origin) return;

    if (originMarkerRef.current) originMarkerRef.current.remove();

    const el = document.createElement("div");
    el.className = "origin-marker";
    el.style.cssText =
      "width:20px;height:20px;background:#1d4ed8;border:3px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3);";

    originMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([origin.lng, origin.lat])
      .addTo(map);

    map.flyTo({ center: [origin.lng, origin.lat], zoom: 14 });
  }, [origin]);

  // Update shop markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    shops.forEach((shop) => {
      const isFrontier = frontierIds.has(shop.id);
      const isSelected = shop.id === selectedShopId;

      const el = document.createElement("div");
      const size = isFrontier ? 18 : 12;
      const bg = isFrontier
        ? isSelected
          ? "#b45309"
          : "#d97706"
        : isSelected
        ? "#6b7280"
        : "#9ca3af";
      el.style.cssText = `width:${size}px;height:${size}px;background:${bg};border:2px solid white;border-radius:50%;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform 0.1s;`;

      const popup = new maplibregl.Popup({ offset: 10 }).setHTML(
        `<div style="font-size:13px;">
          <strong>${shop.name}</strong><br/>
          ⭐ ${shop.rating} (${shop.userRatingCount})<br/>
          ~${Math.round(shop.distance)}m
          ${isFrontier ? '<br/><span style="color:#d97706">✦ Pareto-optimal</span>' : ""}
        </div>`
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([shop.location.lng, shop.location.lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => onShopClick(shop.id));
      markersRef.current.push(marker);
    });

    // Fit map bounds to show all markers including origin
    if (shops.length > 0 && origin) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([origin.lng, origin.lat]);
      shops.forEach((shop) => {
        bounds.extend([shop.location.lng, shop.location.lat]);
      });
      map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [shops, frontierIds, selectedShopId, onShopClick, origin]);

  // Update walking route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const removeRoute = () => {
      if (routeLayerRef.current) {
        if (map.getLayer("walking-route")) map.removeLayer("walking-route");
        if (map.getSource("walking-route")) map.removeSource("walking-route");
        routeLayerRef.current = false;
      }
    };

    if (!walkingRoute) {
      removeRoute();
      return;
    }

    const addRoute = () => {
      removeRoute();
      map.addSource("walking-route", {
        type: "geojson",
        data: { type: "Feature", geometry: walkingRoute },
      });
      map.addLayer({
        id: "walking-route",
        type: "line",
        source: "walking-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#d97706",
          "line-width": 3,
          "line-dasharray": [2, 2],
        },
      });
      routeLayerRef.current = true;
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.once("load", addRoute);
    }
  }, [walkingRoute]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px]" />
  );
}
