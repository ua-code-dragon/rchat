from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import UUID
from dataclasses import dataclass
import uuid
from . import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) # primary keys are required by SQLAlchemy
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(1000))

@dataclass
class Chat(db.Model):
    id: str
    name: str
    owner: str
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(1000))
    owner = db.Column(db.String(1000))



