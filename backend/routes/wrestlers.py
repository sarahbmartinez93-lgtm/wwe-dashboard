from flask import Blueprint, jsonify, request, abort
from pydantic import ValidationError
from db import SessionLocal
from models import Wrestler, Brand, TitleReign
from serializers import wrestler_dict, reign_dict, match_dict
from services.stats import wrestler_stats, recent_matches
from schemas import WrestlerCreate
from errors import validation_error_response, conflict, bad_request

bp = Blueprint("wrestlers", __name__, url_prefix="/api/wrestlers")


@bp.get("")
def list_wrestlers():
    s = SessionLocal()
    q = s.query(Wrestler)

    brand_id = request.args.get("brand", type=int)
    status = request.args.get("status")

    if brand_id is not None:
        q = q.filter(Wrestler.brand_id == brand_id)
    if status in ("active", "inactive"):
        q = q.filter(Wrestler.status == status)

    rows = q.order_by(Wrestler.name).all()
    return jsonify([wrestler_dict(w, stats=wrestler_stats(s, w.id)) for w in rows])


@bp.get("/<int:wrestler_id>")
def get_wrestler(wrestler_id):
    s = SessionLocal()
    w = s.get(Wrestler, wrestler_id)
    if not w:
        abort(404, description="wrestler not found")
    reigns = (
        s.query(TitleReign)
        .filter(TitleReign.wrestler_id == wrestler_id)
        .order_by(TitleReign.won_at.desc())
        .all()
    )
    d = wrestler_dict(w, stats=wrestler_stats(s, w.id))
    d["title_reigns"] = [reign_dict(r) for r in reigns]
    d["recent_matches"] = [match_dict(m) for m in recent_matches(s, wrestler_id, limit=5)]
    return jsonify(d)


@bp.post("")
def create_wrestler():
    try:
        data = WrestlerCreate.model_validate(request.get_json(silent=True) or {})
    except ValidationError as e:
        return validation_error_response(e)

    s = SessionLocal()
    if s.query(Wrestler).filter(Wrestler.name == data.name).first():
        return conflict(f"wrestler '{data.name}' already exists")
    if data.brand_id is not None and not s.get(Brand, data.brand_id):
        return bad_request(f"brand_id {data.brand_id} does not exist")

    w = Wrestler(
        name=data.name,
        brand_id=data.brand_id,
        debut_date=data.debut_date,
        status=data.status,
    )
    s.add(w)
    s.commit()
    s.refresh(w)
    return jsonify(wrestler_dict(w, stats=wrestler_stats(s, w.id))), 201
