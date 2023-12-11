from flask import Blueprint, render_template, current_app
from flask_login import login_required, current_user

main = Blueprint('main', __name__)

@main.route('/')

def index():
    if not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    return render_template('index.html')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html', name=current_user.name)

