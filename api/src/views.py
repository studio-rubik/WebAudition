import typing
import json
import uuid
import itertools
from flask import request, abort, g
from peewee import IntegrityError

from .app import app
from .auth import require_auth
from .utils import make_response
from . import models
from . import storage


@app.route("/webhooks/after-signup", methods=["POST"])
def after_signup():
    req = request.get_json()
    user = req.get("user")
    user_id = user.get("user_id")
    name = user.get("name")
    avatar = user.get("picture")

    try:
        models.Profile.create(user_id=user_id, name=name, avatar=avatar)
    except IntegrityError:
        abort(500)
    else:
        return {}, 200


def get_profile_by_user_id(id: str):
    try:
        prof = models.Profile.get(models.Profile.user_id == id)
    except models.Profile.DoesNotExist:
        abort(404)
    else:
        return make_response(prof.to_dict(), 200)


@app.route("/profiles/me", methods=["GET"])
@require_auth
def profile_me():
    get_profile_by_user_id(g.user.id)


@app.route("/profiles/<user_id>", methods=["GET"])
def profile_get(user_id):
    get_profile_by_user_id(user_id)


def extract_extension(filename: str):
    return filename.rsplit(".", 1)[1].lower()


@app.route("/competitions", methods=["POST"])
@require_auth
def competitions_post():
    req = request.form.get("json")
    req = json.loads(req)
    file = request.files.get("minus_one")
    ext = extract_extension(file.filename)
    if ext not in ["wav", "mp3", "m4a"]:
        abort(400)
    file_key = f"{g.user.id}/{uuid.uuid4()}.{ext}"
    storage.store_file(file, file_key, "minus-one")
    prof = models.Profile.get(models.Profile.user_id == g.user.id)
    resp = models.Competition.create(
        user_id=g.user.id,
        title=req.get("title"),
        requirements=req.get("requirements"),
        minus_one_id=file_key,
        profile=prof,
    )
    return {"competition": resp.to_dict()}, 201


class Entity:
    def __init__(self, data: typing.List[typing.Dict]):
        self._raw = {"by_id": {}, "all_ids": []}
        for dic in data:
            id = str(dic["id"])
            self._raw["by_id"][id] = dic
            self._raw["all_ids"].append(id)

    def to_dict(self):
        return self._raw


@app.route("/competitions", methods=["GET"])
def competitions_get():
    limit = int(request.args.get("limit"))
    offset = int(request.args.get("offset"))

    all_compets = models.Competition.select().order_by(models.Competition.updated_at)

    total = all_compets.count()
    has_more = total >= offset + limit + 1

    compets_model = all_compets.limit(limit).offset(offset)
    compets = [c.to_dict() for c in compets_model]

    appls_nestd = [[appl.to_dict() for appl in c.applications] for c in compets_model]
    appls = list(itertools.chain(*appls_nestd))

    user_ids = set((data["user_id"] for data in itertools.chain(compets, appls)))
    profiles = [
        p.to_dict()
        for p in models.Profile.select().filter(models.Profile.user_id.in_(user_ids))
    ]

    return make_response(
        data={
            "competitions": Entity(compets).to_dict(),
            "applications": Entity(appls).to_dict(),
            "profiles": Entity(profiles).to_dict(),
        },
        has_more=has_more,
        status=200,
    )


@app.route("/competitions/<id>", methods=["GET"])
def competition_get(id: str):
    try:
        compet_model = models.Competition.get_by_id(id)
    except models.Competition.DoesNotExist:
        abort(404)

    compet = compet_model.to_dict()
    appls = [appl.to_dict() for appl in compet_model.applications]
    prof_model = models.Profile.get_by_id(compet.get("profile"))
    prof = prof_model.to_dict()

    return make_response(
        data={
            "competitions": Entity([compet]).to_dict(),
            "applications": Entity(appls).to_dict(),
            "profiles": Entity([prof]).to_dict(),
        },
        has_more=False,
        status=200,
    )


@app.route("/competitions/<compet_id>/applications", methods=["POST"])
@require_auth
def application_post(compet_id: str):
    req = request.get_json()
    compet = models.Competition.get_by_id(compet_id)
    prof = models.Profile.get(models.Profile.user_id == g.user.id)
    application = models.Application.create(
        competition=compet,
        file_url=req.get("file_url"),
        user_id=g.user.id,
        profile=prof,
    )
    return {"application": application.to_dict()}, 201
