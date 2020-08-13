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
    created_at = DateTimeField(formats=[isoformat], default=datetime.datetime.utcnow)
    updated_at = DateTimeField(formats=[isoformat], default=datetime.datetime.utcnow)

    def to_dict(self):
        return model_to_dict(self, recurse=False)


class Profile(BaseModel):
    name = CharField()
    avatar = TextField()
    user_id = CharField(unique=True)


class Competition(BaseModel):
    title = CharField()
    requirements = TextField()
    user_id = CharField()
    profile = ForeignKeyField(Profile)


class CompetitionComment(BaseModel):
    competition = ForeignKeyField(Competition, backref="comments")
    content = TextField()
    user_id = CharField()


class Application(BaseModel):
    competition = ForeignKeyField(Competition, backref="applications")
    contact = CharField()
    user_id = CharField()
    profile = ForeignKeyField(Profile)


class File(BaseModel):
    key = CharField()

    def to_dict(self):
        return model_to_dict(self, recurse=False, extra_attrs=["url"])


class CompetitionFile(File):
    competition = ForeignKeyField(Competition, backref="files")

    @property
    def url(self):
        from . import storage

        return storage.build_public_link(self.key, "competitions")


class ApplicationFile(File):
    application = ForeignKeyField(Application, backref="files")

    @property
    def url(self):
        from . import storage

        return storage.build_public_link(self.key, "applications")


def create_tables():
    with db:
        db.create_tables(
            [
                Profile,
                Competition,
                Application,
                CompetitionComment,
                CompetitionFile,
                ApplicationFile,
            ]
        )
