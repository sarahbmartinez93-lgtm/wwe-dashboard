from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from db import SessionLocal
from models import Event, Brand
from serializers import event_dict
from schemas import EventCreate
from errors import validation_error_response, bad_request

bp = Blueprint("events", __name__, url_prefix="/api/events")


@bp.get("")
def list_events():
    s = SessionLocal()
    q = s.query(Event)
    brand_id = request.args.get("brand", type=int)
    if brand_id is not None:
        q = q.filter(Event.brand_id == brand_id)
    return jsonify([event_dict(e) for e in q.order_by(Event.date.desc()).all()])


@bp.post("")
def create_event():
    try:
        data = EventCreate.model_validate(request.get_json(silent=True) or {})
    except ValidationError as e:
        return validation_error_response(e)

    s = SessionLocal()
    if data.brand_id is not None and not s.get(Brand, data.brand_id):
        return bad_request(f"brand_id {data.brand_id} does not exist")

    e = Event(name=data.name, date=data.date, venue=data.venue, brand_id=data.brand_id)
    s.add(e)
    s.commit()
    s.refresh(e)
    return jsonify(event_dict(e)), 201
