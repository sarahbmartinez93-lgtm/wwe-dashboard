from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from db import SessionLocal
from models import Championship, Wrestler, TitleReign
from serializers import reign_dict
from schemas import TitleChangeCreate
from errors import validation_error_response, bad_request, conflict

bp = Blueprint("title_changes", __name__, url_prefix="/api/title-changes")


@bp.post("")
def create_title_change():
    try:
        data = TitleChangeCreate.model_validate(request.get_json(silent=True) or {})
    except ValidationError as e:
        return validation_error_response(e)

    s = SessionLocal()
    champ = s.get(Championship, data.championship_id)
    if not champ:
        return bad_request(f"championship_id {data.championship_id} does not exist")
    holder = s.get(Wrestler, data.new_holder_id)
    if not holder:
        return bad_request(f"new_holder_id {data.new_holder_id} does not exist")

    current = (
        s.query(TitleReign)
        .filter(TitleReign.championship_id == champ.id, TitleReign.lost_at.is_(None))
        .first()
    )

    if current and current.wrestler_id == holder.id:
        return conflict(f"{holder.name} already holds {champ.name}")
    if current and data.won_at < current.won_at:
        return bad_request(
            f"won_at must be on or after the start of the previous reign ({current.won_at.isoformat()})"
        )

    if current:
        current.lost_at = data.won_at

    new_reign = TitleReign(
        championship_id=champ.id,
        wrestler_id=holder.id,
        won_at=data.won_at,
        lost_at=None,
    )
    s.add(new_reign)
    s.commit()
    s.refresh(new_reign)
    return jsonify({
        "new_reign": reign_dict(new_reign),
        "ended_reign": reign_dict(current) if current else None,
    }), 201
