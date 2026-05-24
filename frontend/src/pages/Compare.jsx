import { useEffect, useState } from "react";
import { api } from "../api/client.js";

function MetricRow({ label, a, b, leader }) {
  return (
    <div className="metric-row">
      <div className={`val${leader === "a" ? " winner" : ""}`}>{a}</div>
      <div className="label">{label}</div>
      <div className={`val${leader === "b" ? " winner" : ""}`}>{b}</div>
    </div>
  );
}

function Side({ side, isLeader }) {
  return (
    <div className={`compare-side${isLeader ? " leader" : ""}`}>
      <h3>{side.name}</h3>
      <div className="card-meta" style={{ marginBottom: 12 }}>
        {side.brand ? <span className={`brand-tag ${side.brand}`}>{side.brand}</span> : "—"}
        {isLeader && <span className="vacant-badge" style={{ marginLeft: 8, background: "var(--gold)", color: "#000" }}>SCORE LEADER</span>}
      </div>
      <div>
        <div className="card-title">Recent matches</div>
        <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-1)" }}>
          {side.recent_matches.length === 0 && <li>No matches recorded.</li>}
          {side.recent_matches.slice(0, 5).map((m) => (
            <li key={m.id}>
              {m.event.name}
              {m.winner?.id === side.id ? " — won" : " — lost"}
              {m.championship && <span style={{ color: "var(--gold)" }}> ({m.championship.name})</span>}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12 }}>
          <div className="card-title">Title reigns</div>
          {side.title_reigns.length === 0 ? (
            <div className="card-meta">No title history.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-1)" }}>
              {side.title_reigns.map((r) => (
                <li key={r.id}>
                  {r.championship.name} — {r.won_at}
                  {r.is_current ? <span style={{ color: "var(--gold)", fontWeight: 600 }}> (current)</span> :
                    <span> → {r.lost_at}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  const [wrestlers, setWrestlers] = useState([]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.wrestlers().then(setWrestlers).catch(() => {}); }, []);

  useEffect(() => {
    if (!a || !b || a === b) { setData(null); return; }
    setLoading(true); setErr(null);
    api.compare(a, b)
      .then(setData)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [a, b]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Compare</h1>
          <div className="subtitle">Side-by-side metrics: win rate, titles, and recent form.</div>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 24 }}>
        <div className="filter-group">
          <label>Wrestler A</label>
          <select value={a} onChange={(e) => setA(e.target.value)}>
            <option value="">Pick…</option>
            {wrestlers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Wrestler B</label>
          <select value={b} onChange={(e) => setB(e.target.value)}>
            <option value="">Pick…</option>
            {wrestlers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      {a && b && a === b && <div className="error">Pick two different wrestlers.</div>}
      {err && <div className="error">{err}</div>}
      {loading && <div className="loading">Loading…</div>}

      {data && (
        <>
          <div className="compare-grid">
            <Side side={data.a} isLeader={data.score_leader_id === data.a.id} />
            <div className="compare-vs">VS</div>
            <Side side={data.b} isLeader={data.score_leader_id === data.b.id} />
          </div>

          <div className="panel" style={{ marginTop: 24 }}>
            <div className="panel-title"><h2>Head-to-head metrics</h2></div>
            {(() => {
              const sa = data.a.stats, sb = data.b.stats;
              const lead = (k) => sa[k] > sb[k] ? "a" : sb[k] > sa[k] ? "b" : null;
              return (
                <>
                  <MetricRow label="Score" a={sa.score} b={sb.score} leader={lead("score")} />
                  <MetricRow label="Win %" a={`${(sa.win_pct * 100).toFixed(0)}%`} b={`${(sb.win_pct * 100).toFixed(0)}%`} leader={lead("win_pct")} />
                  <MetricRow label="Wins" a={sa.wins} b={sb.wins} leader={lead("wins")} />
                  <MetricRow label="Matches" a={sa.matches} b={sb.matches} leader={lead("matches")} />
                  <MetricRow label="Active titles" a={sa.active_titles} b={sb.active_titles} leader={lead("active_titles")} />
                  <MetricRow label="Past reigns" a={sa.past_reigns} b={sb.past_reigns} leader={lead("past_reigns")} />
                </>
              );
            })()}
          </div>
        </>
      )}

      {!data && !loading && !err && !(a && b) && (
        <div className="empty">Pick two wrestlers above to compare them.</div>
      )}
    </>
  );
}
