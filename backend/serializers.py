def brand_dict(b):
    return {"id": b.id, "name": b.name}


def wrestler_dict(w, stats=None):
    d = {
        "id": w.id,
        "name": w.name,
        "brand": brand_dict(w.brand) if w.brand else None,
        "debut_date": w.debut_date.isoformat() if w.debut_date else None,
        "status": w.status,
    }
    if stats is not None:
        d["stats"] = stats
    return d


def championship_dict(c, current_holder=None):
    return {
        "id": c.id,
        "name": c.name,
        "brand": brand_dict(c.brand) if c.brand else None,
        "weight_class": c.weight_class,
        "current_holder": wrestler_dict(current_holder) if current_holder else None,
        "is_vacant": current_holder is None,
    }


def event_dict(e):
    return {
        "id": e.id,
        "name": e.name,
        "date": e.date.isoformat(),
        "venue": e.venue,
        "brand": brand_dict(e.brand) if e.brand else None,
    }


def match_dict(m):
    return {
        "id": m.id,
        "event": event_dict(m.event),
        "match_type": m.match_type,
        "championship": {"id": m.championship.id, "name": m.championship.name} if m.championship else None,
        "winner": {"id": m.winner.id, "name": m.winner.name} if m.winner else None,
        "participants": [{"id": p.id, "name": p.name} for p in m.participants],
        "notes": m.notes,
    }


def reign_dict(r):
    return {
        "id": r.id,
        "championship": {"id": r.championship.id, "name": r.championship.name},
        "wrestler": {"id": r.wrestler.id, "name": r.wrestler.name},
        "won_at": r.won_at.isoformat(),
        "lost_at": r.lost_at.isoformat() if r.lost_at else None,
        "is_current": r.lost_at is None,
    }
