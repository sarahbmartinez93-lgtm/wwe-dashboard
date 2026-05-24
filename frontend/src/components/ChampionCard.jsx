export default function ChampionCard({ championship }) {
  const { name, brand, current_holder, is_vacant } = championship;
  return (
    <div className={`champ-card${is_vacant ? " vacant" : ""}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="title-name">{name}</span>
        {brand && <span className={`brand-tag ${brand.name}`}>{brand.name}</span>}
      </div>
      <div className="holder">
        {is_vacant ? "VACANT" : current_holder.name}
        {is_vacant && <span className="vacant-badge" style={{ marginLeft: 8 }}>NO CHAMPION</span>}
      </div>
      <div className="card-meta">{championship.weight_class}</div>
    </div>
  );
}
