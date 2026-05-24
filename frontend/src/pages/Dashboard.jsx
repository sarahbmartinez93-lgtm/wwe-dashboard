import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import FilterBar from "../components/FilterBar.jsx";
import ChampionCard from "../components/ChampionCard.jsx";
import RankingTable from "../components/RankingTable.jsx";
import { SkeletonGrid, SkeletonRows } from "../components/Skeleton.jsx";
import { useUrlFilters } from "../hooks/useUrlFilters.js";

export default function Dashboard() {
  const [filters, setFilters] = useUrlFilters({ status: "all" });
  const [champs, setChamps] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setErr(null);
    Promise.all([
      api.currentChampions({ brand: filters.brand }),
      api.rankings({ brand: filters.brand }),
    ])
      .then(([c, r]) => {
        let visible = c;
        if (filters.status === "active") visible = c.filter((x) => !x.is_vacant);
        if (filters.status === "vacant") visible = c.filter((x) => x.is_vacant);
        setChamps(visible);
        setRankings(r);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [filters.brand, filters.status, reloadKey]);

  const totals = useMemo(() => {
    const totalMatches = rankings.reduce((acc, r) => acc + r.matches, 0) / 2;
    const totalWins = rankings.reduce((acc, r) => acc + r.wins, 0);
    const avgWinPct = rankings.length
      ? rankings.reduce((a, r) => a + r.win_pct, 0) / rankings.length
      : 0;
    const vacantCount = champs.filter((c) => c.is_vacant).length;
    return { totalMatches, totalWins, avgWinPct, vacantCount };
  }, [rankings, champs]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">Live snapshot of titles, rankings, and match data.</div>
        </div>
      </div>

      <FilterBar value={filters} onChange={setFilters} show={{ brand: true, titleStatus: true }} />

      {err && (
        <div className="error" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Failed to load: {err}</span>
          <button className="btn secondary" onClick={() => setReloadKey((k) => k + 1)}>Retry</button>
        </div>
      )}
      {loading && (
        <>
          <SkeletonGrid count={4} />
          <div className="panel" style={{ marginTop: 20 }}>
            <SkeletonGrid count={6} />
          </div>
          <div className="panel">
            <SkeletonRows rows={6} cols={6} />
          </div>
        </>
      )}

      {!loading && !err && (
        <>
          <div className="card-grid" style={{ marginBottom: 20 }}>
            <div className="card">
              <span className="card-title">Wrestlers tracked</span>
              <span className="card-value">{rankings.length}</span>
              <span className="card-meta">in selected scope</span>
            </div>
            <div className="card">
              <span className="card-title">Total matches</span>
              <span className="card-value">{Math.round(totals.totalMatches)}</span>
              <span className="card-meta">{totals.totalWins} recorded wins</span>
            </div>
            <div className="card">
              <span className="card-title">Avg win %</span>
              <span className="card-value">{(totals.avgWinPct * 100).toFixed(0)}%</span>
              <span className="card-meta">across all tracked wrestlers</span>
            </div>
            <div className="card">
              <span className="card-title">Vacant titles</span>
              <span className="card-value" style={{ color: totals.vacantCount ? "var(--red)" : "var(--text-0)" }}>
                {totals.vacantCount}
              </span>
              <span className="card-meta">needs a new champion</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title"><h2>Current Champions</h2></div>
            {champs.length === 0 ? (
              <div className="empty">
                No championships match these filters.
                <span className="hint">Try clearing the brand or status filter.</span>
              </div>
            ) : (
              <div className="card-grid">
                {champs.map((c) => <ChampionCard key={c.id} championship={c} />)}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-title"><h2>Wrestler Rankings</h2></div>
            <div className="table-wrap">
              <RankingTable rows={rankings} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
