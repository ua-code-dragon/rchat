#!/usr/bin/python

from chat import application, db

with application.app_context():
    db.create_all()


