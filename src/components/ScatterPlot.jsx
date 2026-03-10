import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

export default function ScatterPlot({ shops, frontierIds, selectedShopId, onShopClick }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || shops.length === 0) {
      if (containerRef.current) Plotly.purge(containerRef.current);
      return;
    }

    const dominated = shops.filter((s) => !frontierIds.has(s.id));
    const frontier = shops
      .filter((s) => frontierIds.has(s.id))
      .sort((a, b) => a.distance - b.distance);

    const dominatedTrace = {
      x: dominated.map((s) => Math.round(s.distance)),
      y: dominated.map((s) => s.rating),
      text: dominated.map((s) => s.name),
      customdata: dominated.map((s) => s.id),
      mode: "markers",
      type: "scatter",
      name: "Dominated",
      marker: {
        color: dominated.map((s) =>
          s.id === selectedShopId ? "#6b7280" : "#d1d5db"
        ),
        size: dominated.map((s) => (s.id === selectedShopId ? 10 : 7)),
        line: { color: "#6b7280", width: 1 },
      },
      hovertemplate:
        "<b>%{text}</b><br>Distance: %{x}m<br>Rating: %{y}<extra></extra>",
    };

    const frontierTrace = {
      x: frontier.map((s) => Math.round(s.distance)),
      y: frontier.map((s) => s.rating),
      text: frontier.map((s) => s.name),
      customdata: frontier.map((s) => s.id),
      mode: "lines+markers",
      type: "scatter",
      line: { shape: "hv", color: "#d97706", width: 2 },
      name: "Pareto Frontier",
      marker: {
        color: frontier.map((s) =>
          s.id === selectedShopId ? "#b45309" : "#d97706"
        ),
        size: frontier.map((s) => (s.id === selectedShopId ? 14 : 10)),
        line: { color: "white", width: 1.5 },
      },
      hovertemplate:
        "<b>%{text}</b><br>Distance: %{x}m<br>Rating: %{y}<br><span style='color:#d97706'>✦ Pareto-optimal</span><extra></extra>",
    };

    const layout = {
      xaxis: { title: "Distance (m)", zeroline: false },
      yaxis: { title: "Rating", range: [0, 5.2], zeroline: false },
      margin: { t: 20, r: 20, b: 50, l: 50 },
      legend: { x: 1, xanchor: "right", y: 0, yanchor: "bottom" },
      hovermode: "closest",
      plot_bgcolor: "#fafafa",
      paper_bgcolor: "white",
    };

    const config = { responsive: true, displayModeBar: false };

    Plotly.react(containerRef.current, [dominatedTrace, frontierTrace], layout, config);

    const el = containerRef.current;
    const handler = (data) => {
      if (data.points && data.points[0]) {
        const id = data.points[0].customdata;
        if (id) onShopClick(id);
      }
    };
    el.on("plotly_click", handler);
    return () => el.removeAllListeners && el.removeAllListeners("plotly_click");
  }, [shops, frontierIds, selectedShopId, onShopClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px]"
      style={{ minHeight: 300 }}
    />
  );
}
