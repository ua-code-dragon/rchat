from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager 
from redis import Redis

db = SQLAlchemy()
rb = Redis(host="localhost", port=6379, db=0)

def create_app():
    app = Flask(__name__,static_url_path='/static',static_folder='static',template_folder='templates')
    app.config['SECRET_KEY'] = '9OLWxND4o83j4K4iuopO'
    app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql+psycopg2://rchat:q1w2e3??@localhost/rchat"

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    from .models import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)
    
    from .chat import chat as chat_blueprint
    app.register_blueprint(chat_blueprint)

    return app

application = create_app()

