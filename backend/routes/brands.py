from flask import Blueprint, jsonify
from db import SessionLocal
from models import Brand
from serializers import brand_dict

bp = Blueprint("brands", __name__, url_prefix="/api/brands")


@bp.get("")
def list_brands():
    s = SessionLocal()
    return jsonify([brand_dict(b) for b in s.query(Brand).order_by(Brand.name).all()])
