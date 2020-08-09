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


class Profile(BaseModel):
    name = CharField()
    avatar = TextField()
    user_id = CharField(unique=True)


class Competition(BaseModel):
    title = CharField()
    requirements = TextField()
    minus_one_url = TextField()
    user_id = CharField()
    profile = ForeignKeyField(Profile)


class Application(BaseModel):
    competition = ForeignKeyField(Competition, backref="applications")
    file_url = TextField()
    user_id = CharField()
    profile = ForeignKeyField(Profile)


def create_tables():
    with db:
        db.create_tables([Profile, Competition, Application])
