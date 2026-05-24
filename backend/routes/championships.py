from flask import Blueprint, jsonify, request
from db import SessionLocal
from models import Championship, TitleReign
from serializers import championship_dict

bp = Blueprint("championships", __name__, url_prefix="/api/championships")


def _current_holder(session, championship_id):
    r = (
        session.query(TitleReign)
        .filter(TitleReign.championship_id == championship_id, TitleReign.lost_at.is_(None))
        .first()
    )
    return r.wrestler if r else None


@bp.get("")
def list_championships():
    s = SessionLocal()
    q = s.query(Championship)
    brand_id = request.args.get("brand", type=int)
    if brand_id is not None:
        q = q.filter(Championship.brand_id == brand_id)

    rows = q.order_by(Championship.name).all()
    out = [championship_dict(c, _current_holder(s, c.id)) for c in rows]

    status = request.args.get("status", "all")
    if status == "active":
        out = [c for c in out if not c["is_vacant"]]
    elif status == "vacant":
        out = [c for c in out if c["is_vacant"]]
    return jsonify(out)
