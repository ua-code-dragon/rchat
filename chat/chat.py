from flask import Blueprint, render_template, redirect, url_for, request, flash, current_app, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from .models import User, Chat
from bson import dumps, loads
from . import db, rb

chat = Blueprint('chat', __name__)

@chat.route('/chat', methods=['GET'])
@login_required
def chats():
    chats = Chat.query.all()
    return jsonify(chats)

@chat.route('/chat', methods=['POST'])
@login_required
def newchat():
    name = request.json.get('name')
    chat = Chat.query.filter_by(name=name).first()
    if chat:
        flash('Chat already exists')
        return redirect(url_for('main.index'))
    new_chat = Chat(name=name, owner=current_user.email)        
    db.session.add(new_chat)
    db.session.commit()
    return redirect(url_for('main.index'))

@chat.route('/message', methods=['POST'])
@login_required
def postmessage():
    msg = {
        "timestamp":    request.json.get("timestamp"),
        "author_name":  request.json.get("author_name"),
        "author_email": request.json.get("author_email"),
        "text":         request.json.get("text"),
        "image":        request.json.get("image")
    }
    key = "CH:MSG:%s" % request.json.get("chat")
    rb.lpush(key,dumps(msg))
    return jsonify({"ok":True})

@chat.route('/messages', methods=['POST'])
@login_required
def getmessages():
    chat = request.json.get("chat")
    last = request.json.get("last")
    last = int(last) if last else 16
    key = "CH:MSG:%s" % chat
    msgs = list(map(loads,rb.lrange(key,0,last)));
    return jsonify(msgs)


