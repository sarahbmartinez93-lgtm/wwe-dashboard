from flask import Flask, jsonify
from flask_cors import CORS
from db import init_db, SessionLocal
from routes import brands, wrestlers, championships, events, matches, stats, title_changes


def create_app():
    app = Flask(__name__)
    CORS(app)

    init_db()

    app.register_blueprint(brands.bp)
    app.register_blueprint(wrestlers.bp)
    app.register_blueprint(championships.bp)
    app.register_blueprint(events.bp)
    app.register_blueprint(matches.bp)
    app.register_blueprint(stats.bp)
    app.register_blueprint(title_changes.bp)

    @app.teardown_appcontext
    def remove_session(exc=None):
        SessionLocal.remove()

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "bad_request", "message": str(e.description)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "not_found", "message": str(e.description)}), 404

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=5050, debug=True)
