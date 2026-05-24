export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-line w-40" />
      <div className="skeleton-line w-60 lg" />
      <div className="skeleton-line w-50" />
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonRows({ rows = 6, cols = 6 }) {
  return (
    <table className="table">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}><div className="skeleton-line w-80" /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
