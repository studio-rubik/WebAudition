from flask import request, abort, g
from boto3.exceptions import Boto3Error
from botocore.client import ClientError
from playhouse.shortcuts import model_to_dict

from .app import app
from .auth import require_auth
from .deps import s3
from .utils import make_response
from . import models


@app.route("/competitions", methods=["POST"])
@require_auth
def competitions_post():
    req = request.get_json()
    resp = models.Competition.create(
        user_id=g.user.id,
        title=req.get("title"),
        requirements=req.get("requirements"),
        minus_one_url=req.get("minus_one_url"),
    )
    return {"competition": model_to_dict(resp)}, 201


@app.route("/competitions", methods=["GET"])
def competitions_get():
    limit = int(request.args.get("limit"))
    offset = int(request.args.get("offset"))
    compets = models.Competition.select().order_by(models.Competition.updated_at)
    total = compets.count()
    part = compets.limit(limit).offset(offset)
    has_more = total >= offset + limit + 1

    compets_resp = {"byId": {}, "allIds": []}

    for c in part:
        d = model_to_dict(c)
        id = str(d["id"])
        compets_resp["byId"][id] = d
        compets_resp["allIds"].append(id)

    return make_response(
        data={
            "competitions": compets_resp,
            "applications": [
                [model_to_dict(appl) for appl in c.applications] for c in part
            ],
        },
        has_more=has_more,
        status=200,
    )


@app.route("/competitions/<id>", methods=["GET"])
def competition_get(id: str):
    try:
        compet = models.Competition.get_by_id(id)
    except models.Competition.DoesNotExist:
        abort(404)

    return (
        {
            "competition": model_to_dict(compet),
            "applications": [model_to_dict(appl) for appl in compet.applications],
        },
        200,
    )


@app.route("/competitions/<compet_id>/applications", methods=["POST"])
@require_auth
def application_post(compet_id: str):
    req = request.get_json()
    compet = (
        models.Competition.select().where(models.Competition.id == compet_id).first()
    )
    application = models.Application.create(
        competition=compet, file_url=req.get("file_url"), user_id=g.user.id
    )
    return {"application": model_to_dict(application)}, 201


@app.route("/files", methods=["POST"])
def files():
    bucket_name = "files"
    try:
        s3.meta.client.head_bucket(Bucket=bucket_name)
    except ClientError:
        bucket = s3.create_bucket(Bucket=bucket_name)
    else:
        bucket = s3.Bucket(bucket_name)

    for name, file in request.files.items():
        try:
            bucket.upload_fileobj(file, file.filename)
        except Boto3Error:
            abort(500)

    return {}, 201
