import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import FilterBar from "../components/FilterBar.jsx";
import { SkeletonRows } from "../components/Skeleton.jsx";
import { useUrlFilters } from "../hooks/useUrlFilters.js";

export default function Matches() {
  const [filters, setFilters] = useUrlFilters({});
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setErr(null);
    api.matches(filters)
      .then(setRows)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [filters.brand, filters.match_type, filters.championship, filters.event]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Matches</h1>
          <div className="subtitle">Recent match history with championship context.</div>
        </div>
      </div>

      <FilterBar
        value={filters}
        onChange={setFilters}
        show={{ brand: true, matchType: true, championship: true, event: true }}
      />

      {err && <div className="error">{err}</div>}
      {loading ? (
        <div className="panel"><SkeletonRows rows={6} cols={6} /></div>
      ) : (
        <div className="panel">
          {rows.length === 0 ? (
            <div className="empty">
              No matches match these filters.
              <span className="hint">Clear filters or pick a different event / championship.</span>
            </div>
          ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Event</th><th>Type</th><th>Championship</th><th>Participants</th><th>Winner</th></tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td>{m.event.date}</td>
                    <td>{m.event.name}</td>
                    <td>{m.match_type}</td>
                    <td>{m.championship?.name ?? "—"}</td>
                    <td>{m.participants.map((p) => p.name).join(" vs ")}</td>
                    <td style={{ color: "var(--gold)", fontWeight: 600 }}>{m.winner?.name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </>
  );
}
