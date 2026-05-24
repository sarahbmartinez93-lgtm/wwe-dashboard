from flask import Blueprint, jsonify, request, abort
from db import SessionLocal
from models import Championship, Wrestler, TitleReign
from serializers import championship_dict, reign_dict, match_dict
from services.stats import rankings, wrestler_stats, recent_matches

bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@bp.get("/current-champions")
def current_champions():
    s = SessionLocal()
    q = s.query(Championship)
    brand_id = request.args.get("brand", type=int)
    if brand_id is not None:
        q = q.filter(Championship.brand_id == brand_id)

    out = []
    for c in q.order_by(Championship.name).all():
        reign = (
            s.query(TitleReign)
            .filter(TitleReign.championship_id == c.id, TitleReign.lost_at.is_(None))
            .first()
        )
        out.append(championship_dict(c, reign.wrestler if reign else None))
    return jsonify(out)


@bp.get("/rankings")
def get_rankings():
    s = SessionLocal()
    brand_id = request.args.get("brand", type=int)
    return jsonify(rankings(s, brand_id=brand_id))


@bp.get("/top-wrestlers")
def top_wrestlers():
    s = SessionLocal()
    brand_id = request.args.get("brand", type=int)
    limit = request.args.get("limit", default=5, type=int)
    return jsonify(rankings(s, brand_id=brand_id)[:limit])


@bp.get("/compare")
def compare():
    a_id = request.args.get("a", type=int)
    b_id = request.args.get("b", type=int)
    if a_id is None or b_id is None:
        abort(400, description="query params 'a' and 'b' are required")
    if a_id == b_id:
        abort(400, description="'a' and 'b' must be different wrestlers")

    s = SessionLocal()
    a = s.get(Wrestler, a_id)
    b = s.get(Wrestler, b_id)
    if not a or not b:
        abort(404, description="wrestler not found")

    def side(w):
        reigns = (
            s.query(TitleReign)
            .filter(TitleReign.wrestler_id == w.id)
            .order_by(TitleReign.won_at.desc())
            .all()
        )
        return {
            "id": w.id,
            "name": w.name,
            "brand": w.brand.name if w.brand else None,
            "stats": wrestler_stats(s, w.id),
            "title_reigns": [reign_dict(r) for r in reigns],
            "recent_matches": [match_dict(m) for m in recent_matches(s, w.id, limit=5)],
        }

    sa, sb = side(a), side(b)
    winner = None
    if sa["stats"]["score"] > sb["stats"]["score"]:
        winner = sa["id"]
    elif sb["stats"]["score"] > sa["stats"]["score"]:
        winner = sb["id"]

    return jsonify({"a": sa, "b": sb, "score_leader_id": winner})
