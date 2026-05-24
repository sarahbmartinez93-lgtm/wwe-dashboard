import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import FilterBar from "../components/FilterBar.jsx";
import { SkeletonRows } from "../components/Skeleton.jsx";
import { useUrlFilters } from "../hooks/useUrlFilters.js";

export default function Wrestlers() {
  const [filters, setFilters] = useUrlFilters({});
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setErr(null);
    api.wrestlers(filters)
      .then(setRows)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [filters.brand, filters.status]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Wrestlers</h1>
          <div className="subtitle">All tracked competitors with computed stats.</div>
        </div>
      </div>

      <FilterBar value={filters} onChange={setFilters} show={{ brand: true, wrestlerStatus: true }} />

      {err && <div className="error">{err}</div>}
      {loading ? (
        <div className="panel"><SkeletonRows rows={8} cols={8} /></div>
      ) : (
        <div className="panel">
          {rows.length === 0 ? (
            <div className="empty">
              No wrestlers match.
              <span className="hint">Try clearing filters or add a new wrestler from Admin.</span>
            </div>
          ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Brand</th><th>Status</th><th>Debut</th><th>W-L</th><th>Win %</th><th>Active titles</th><th>Score</th></tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>{w.brand ? <span className={`brand-tag ${w.brand.name}`}>{w.brand.name}</span> : "—"}</td>
                    <td>{w.status}</td>
                    <td>{w.debut_date ?? "—"}</td>
                    <td>{w.stats.wins}-{w.stats.losses}</td>
                    <td>{(w.stats.win_pct * 100).toFixed(0)}%</td>
                    <td>{w.stats.active_titles}</td>
                    <td><span className="score-pill">{w.stats.score}</span></td>
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
