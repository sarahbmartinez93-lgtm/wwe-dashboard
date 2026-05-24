export default function RankingTable({ rows, maxScore }) {
  if (!rows.length) return <div className="empty">No wrestlers match these filters.</div>;
  const top = maxScore || rows[0]?.score || 1;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Wrestler</th>
          <th>Brand</th>
          <th>W-L</th>
          <th>Win %</th>
          <th>Titles</th>
          <th>Score</th>
          <th style={{ width: 140 }}>vs leader</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className={`rank-num${r.rank <= 3 ? " top" : ""}`}>{r.rank}</td>
            <td>{r.name}</td>
            <td>{r.brand ? <span className={`brand-tag ${r.brand}`}>{r.brand}</span> : "—"}</td>
            <td>{r.wins}-{r.losses}</td>
            <td>{(r.win_pct * 100).toFixed(0)}%</td>
            <td>{r.active_titles}{r.past_reigns ? ` (+${r.past_reigns})` : ""}</td>
            <td><span className="score-pill">{r.score}</span></td>
            <td><div className="bar"><span style={{ width: `${Math.min(100, (r.score / top) * 100)}%` }} /></div></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
