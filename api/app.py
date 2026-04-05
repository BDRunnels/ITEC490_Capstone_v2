from flask import Flask
from flask_cors import CORS
from db.schema import init_db

# Route blueprints
from routes.ingest import ingest_bp
from routes.reports import reports_bp
from routes.admin import admin_bp
from routes.agent import agent_bp
from routes.reports import search_bp
from routes.reports import cve_bp




def create_app():
    app = Flask(__name__)
    CORS(app)

    # Initialize database schema
    init_db()

    # Blueprints already define /api/... routes internally
    app.register_blueprint(ingest_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(agent_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(cve_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)