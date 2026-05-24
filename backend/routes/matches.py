from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from db import SessionLocal
from models import Match, Event, Championship, Wrestler
from serializers import match_dict
from schemas import MatchCreate
from errors import validation_error_response, bad_request

bp = Blueprint("matches", __name__, url_prefix="/api/matches")


@bp.get("")
def list_matches():
    s = SessionLocal()
    q = s.query(Match).join(Event, Match.event_id == Event.id)

    brand_id = request.args.get("brand", type=int)
    championship_id = request.args.get("championship", type=int)
    match_type = request.args.get("match_type")
    event_id = request.args.get("event", type=int)

    if brand_id is not None:
        q = q.outerjoin(Championship, Match.championship_id == Championship.id)
        q = q.filter((Event.brand_id == brand_id) | (Championship.brand_id == brand_id))
    if championship_id is not None:
        q = q.filter(Match.championship_id == championship_id)
    if match_type:
        q = q.filter(Match.match_type == match_type)
    if event_id is not None:
        q = q.filter(Match.event_id == event_id)

    rows = q.order_by(Event.date.desc(), Match.id.desc()).all()
    return jsonify([match_dict(m) for m in rows])


@bp.post("")
def create_match():
    try:
        data = MatchCreate.model_validate(request.get_json(silent=True) or {})
    except ValidationError as e:
        return validation_error_response(e)

    s = SessionLocal()
    if not s.get(Event, data.event_id):
        return bad_request(f"event_id {data.event_id} does not exist")
    if data.championship_id is not None and not s.get(Championship, data.championship_id):
        return bad_request(f"championship_id {data.championship_id} does not exist")

    participants = s.query(Wrestler).filter(Wrestler.id.in_(data.participant_ids)).all()
    if len(participants) != len(data.participant_ids):
        found = {w.id for w in participants}
        missing = [pid for pid in data.participant_ids if pid not in found]
        return bad_request(f"unknown participant_ids: {missing}")

    if data.winner_id is not None and data.winner_id not in data.participant_ids:
        return bad_request("winner_id must be one of the participant_ids")

    m = Match(
        event_id=data.event_id,
        match_type=data.match_type,
        championship_id=data.championship_id,
        winner_id=data.winner_id,
        notes=data.notes,
        participants=participants,
    )
    s.add(m)
    s.commit()
    s.refresh(m)
    return jsonify(match_dict(m)), 201
