import uuid
import datetime
import dsnparse
from peewee import (
    MySQLDatabase,
    Model,
    CharField,
    TextField,
    ForeignKeyField,
    UUIDField,
    DateTimeField,
)
from playhouse.shortcuts import model_to_dict

from .app import app


dsn = dsnparse.parse(app.config["DSN"])

db = MySQLDatabase(
    "app", user=dsn.user, password=dsn.password, host=dsn.host, port=dsn.port
)

isoformat = "%Y-%m-%dT%H:%M:%S.%f"


class BaseModel(Model):
    class Meta:
        database = db

    id = UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = DateTimeField(formats=[isoformat], default=datetime.datetime.now)
    updated_at = DateTimeField(formats=[isoformat], default=datetime.datetime.now)

    def to_dict(self):
        return model_to_dict(self, recurse=False)


class Profile(BaseModel):
    name = CharField()
    avatar = TextField()
    user_id = CharField(unique=True)


class Competition(BaseModel):
    title = CharField()
    requirements = TextField()
    minus_one_id = CharField()
    user_id = CharField()
    profile = ForeignKeyField(Profile)

    @property
    def minus_one_url(self):
        from . import storage

        return storage.build_public_link(self.minus_one_id, "minus-one")

    def to_dict(self):
        return model_to_dict(self, recurse=False, extra_attrs=["minus_one_url"])


class Application(BaseModel):
    competition = ForeignKeyField(Competition, backref="applications")
    file_id = CharField()
    user_id = CharField()
    profile = ForeignKeyField(Profile)

    @property
    def file_url(self):
        from . import storage

        return storage.build_public_link(self.file_id, "application-files")

    def to_dict(self):
        return model_to_dict(self, recurse=False, extra_attrs=["file_url"])


def create_tables():
    with db:
        db.create_tables([Profile, Competition, Application])
