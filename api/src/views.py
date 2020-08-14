import typing
import json
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
    meta = user.get("user_metadata")
    name = meta.get("name")
    avatar = f"https://avatars.dicebear.com/api/identicon/{user_id}.svg"

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
        return prof.to_dict(), 200


@app.route("/me/profile", methods=["GET"])
@require_auth
def profile_me():
    return get_profile_by_user_id(g.user.id)


@app.route("/profiles/<user_id>", methods=["GET"])
def profile_get(user_id):
    return get_profile_by_user_id(user_id)


def extract_extension(filename: str):
    return filename.rsplit(".", 1)[1].lower()


@app.route("/competitions", methods=["POST"])
@require_auth
def competitions_post():
    req = request.form.get("json")
    req = json.loads(req)

    prof = models.Profile.get(models.Profile.user_id == g.user.id)
    compet = models.Competition.create(
        user_id=g.user.id,
        title=req.get("title"),
        requirements=req.get("requirements"),
        profile=prof,
    )
    for _, file in request.files.items():
        file_key = f"{compet.id}/{file.filename}"
        models.CompetitionFile.create(key=file_key, competition=compet)
        storage.store_file(file, file_key, "competitions")

    return {"competition": compet.to_dict()}, 201


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

    all_compets = models.Competition.select().order_by(
        models.Competition.updated_at.desc()
    )

    total = all_compets.count()
    has_more = total >= offset + limit + 1

    compets_model = all_compets.limit(limit).offset(offset)
    compets = [c.to_dict() for c in compets_model]

    compet_files_nested = [
        [
            file.to_dict()
            for file in c.files.order_by(models.CompetitionFile.updated_at.asc())
        ]
        for c in compets_model
    ]
    compet_files = list(itertools.chain(*compet_files_nested))

    comments_nested = [
        [
            comment.to_dict()
            for comment in c.comments.order_by(
                models.CompetitionComment.updated_at.asc()
            )
        ]
        for c in compets_model
    ]
    comments = list(itertools.chain(*comments_nested))

    user_ids = set((data["user_id"] for data in (*compets, *comments)))
    profiles = [
        p.to_dict()
        for p in models.Profile.select().filter(models.Profile.user_id.in_(user_ids))
    ]

    return make_response(
        data={
            "competitions": Entity(compets).to_dict(),
            "competition_comments": Entity(comments).to_dict(),
            "competition_files": Entity(compet_files).to_dict(),
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

    compet_files = [
        file.to_dict()
        for file in compet_model.files.order_by(models.CompetitionFile.updated_at.asc())
    ]

    comments = [
        file.to_dict()
        for file in compet_model.comments.order_by(
            models.CompetitionComment.updated_at.asc()
        )
    ]

    profs_model = models.Profile.select().filter(
        (models.Profile.user_id == compet.get("profile"))
        | (models.Profile.user_id.in_([c.get("user_id") for c in comments]))
    )
    profs = [p.to_dict() for p in profs_model]

    return make_response(
        data={
            "competitions": Entity([compet]).to_dict(),
            "competition_comments": Entity(comments).to_dict(),
            "competition_files": Entity(compet_files).to_dict(),
            "profiles": Entity(profs).to_dict(),
        },
        has_more=False,
        status=200,
    )


@app.route("/competitions/<compet_id>/comments", methods=["POST"])
@require_auth
def comment_post(compet_id: str):
    req = request.get_json()
    content = req.get("content")

    compet = models.Competition.get_by_id(compet_id)

    comment = models.CompetitionComment.create(
        competition=compet, content=content, user_id=g.user.id
    )

    return comment.to_dict(), 201


@app.route("/competitions/<compet_id>/applications", methods=["POST"])
@require_auth
def application_post(compet_id: str):
    req = json.loads(request.form.get("json"))

    compet = models.Competition.get_by_id(compet_id)
    prof = models.Profile.get(models.Profile.user_id == g.user.id)
    appl = models.Application.create(
        competition=compet, contact=req.get("contact"), user_id=g.user.id, profile=prof,
    )
    for _, file in request.files.items():
        file_key = f"{appl.id}/{file.filename}"
        models.ApplicationFile.create(key=file_key, application=appl)
        storage.store_file(file, file_key, "applications")

    return {"application": appl.to_dict()}, 201


@app.route("/reactions", methods=["GET"])
@require_auth
def reactions_get():
    limit = int(request.args.get("limit"))
    offset = int(request.args.get("offset"))

    all_compets = (
        models.Competition.select()
        .where(models.Competition.user_id == g.user.id)
        .order_by(models.Competition.created_at.desc())
    )

    total = all_compets.count()
    has_more = total >= offset + limit + 1

    compets_model = all_compets.limit(limit).offset(offset)
    compets = [c.to_dict() for c in compets_model]

    appls_model = (
        models.Application.select()
        .where(models.Application.competition.in_([c["id"] for c in compets]))
        .order_by(models.Application.created_at.desc())
    )
    appls = [appl.to_dict() for appl in appls_model]

    appl_files_nested = [
        [
            file.to_dict()
            for file in appl.files.order_by(models.ApplicationFile.created_at.asc())
        ]
        for appl in appls_model
    ]
    appl_files = list(itertools.chain(*appl_files_nested))

    compet_files_nested = [
        [
            file.to_dict()
            for file in c.files.order_by(models.CompetitionFile.created_at.asc())
        ]
        for c in compets_model
    ]
    compet_files = list(itertools.chain(*compet_files_nested))

    user_ids = set((data["user_id"] for data in appls))
    profiles = [
        p.to_dict()
        for p in models.Profile.select().filter(models.Profile.user_id.in_(user_ids))
    ]

    return make_response(
        data={
            "competitions": Entity(compets).to_dict(),
            "applications": Entity(appls).to_dict(),
            "competition_files": Entity(compet_files).to_dict(),
            "application_files": Entity(appl_files).to_dict(),
            "profiles": Entity(profiles).to_dict(),
        },
        has_more=has_more,
        status=200,
    )
