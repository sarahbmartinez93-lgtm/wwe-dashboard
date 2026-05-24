from sqlalchemy import func
from sqlalchemy.orm import Session
from models import Wrestler, Match, TitleReign, Event, match_participants


def wrestler_stats(session: Session, wrestler_id: int) -> dict:
    """Returns wins, losses, win_pct, active_titles, past_reigns, score."""
    total_matches = (
        session.query(func.count(match_participants.c.match_id))
        .filter(match_participants.c.wrestler_id == wrestler_id)
        .scalar()
    )
    wins = session.query(func.count(Match.id)).filter(Match.winner_id == wrestler_id).scalar()
    losses = max(total_matches - wins, 0)
    win_pct = (wins / total_matches) if total_matches else 0.0

    active_titles = (
        session.query(func.count(TitleReign.id))
        .filter(TitleReign.wrestler_id == wrestler_id, TitleReign.lost_at.is_(None))
        .scalar()
    )
    past_reigns = (
        session.query(func.count(TitleReign.id))
        .filter(TitleReign.wrestler_id == wrestler_id, TitleReign.lost_at.is_not(None))
        .scalar()
    )

    score = round(win_pct * 100 + (20 if active_titles else 0) + past_reigns * 5, 2)
    return {
        "matches": total_matches,
        "wins": wins,
        "losses": losses,
        "win_pct": round(win_pct, 4),
        "active_titles": active_titles,
        "past_reigns": past_reigns,
        "score": score,
    }


def rankings(session: Session, brand_id: int | None = None) -> list[dict]:
    q = session.query(Wrestler)
    if brand_id is not None:
        q = q.filter(Wrestler.brand_id == brand_id)
    out = []
    for w in q.all():
        s = wrestler_stats(session, w.id)
        out.append({
            "id": w.id,
            "name": w.name,
            "brand": w.brand.name if w.brand else None,
            "status": w.status,
            **s,
        })
    out.sort(key=lambda r: r["score"], reverse=True)
    for i, r in enumerate(out, 1):
        r["rank"] = i
    return out


def recent_matches(session: Session, wrestler_id: int, limit: int = 5) -> list[Match]:
    return (
        session.query(Match)
        .join(match_participants, match_participants.c.match_id == Match.id)
        .join(Event, Match.event_id == Event.id)
        .filter(match_participants.c.wrestler_id == wrestler_id)
        .order_by(Event.date.desc())
        .limit(limit)
        .all()
    )
