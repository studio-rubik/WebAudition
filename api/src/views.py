from flask import request

from .app import app
from .auth import require_auth
from . import models


@app.route("/", methods=["GET"])
@require_auth
def test_auth():
    return {}, 200


@app.route("/users", methods=["POST"])
def users():
    req = request.get_json()
    user = models.User.create(name=req.get("name"))
    return {"id": user.id, "name": user.name}, 200
