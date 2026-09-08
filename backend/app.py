from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime, timedelta
from sqlalchemy import inspect, text
import os

from config import *
from models import db, User, Project, Task

load_dotenv()

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)


def parse_datetime(value):
    """Convert an ISO date/datetime from the API into a database datetime."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(value.replace('Z', '+00:00')).replace(tzinfo=None)


def project_payload(project):
    completed_tasks = len([task for task in project.tasks if task.status == 'completed'])
    return {
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'priority': project.priority,
        'due_date': project.due_date.isoformat() if project.due_date else None,
        'owner_id': project.owner_id,
        'created_at': project.created_at.isoformat(),
        'task_count': len(project.tasks)
        ,'completed_count': completed_tasks
        ,'progress': round((completed_tasks / len(project.tasks)) * 100) if project.tasks else 0
    }


def task_payload(task):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'due_date': task.due_date.isoformat() if task.due_date else None,
        'position': task.position,
        'project_id': task.project_id,
        'created_at': task.created_at.isoformat()
    }


def ensure_project_columns():
    """Add fields introduced after the initial schema when using create_all."""
    columns = {column['name'] for column in inspect(db.engine).get_columns('projects')}
    if 'priority' not in columns:
        db.session.execute(text(
            "ALTER TABLE projects ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium'"
        ))
    if 'due_date' not in columns:
        db.session.execute(text('ALTER TABLE projects ADD COLUMN due_date DATETIME'))
    task_columns = {column['name'] for column in inspect(db.engine).get_columns('tasks')}
    if 'priority' not in task_columns:
        db.session.execute(text(
            "ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'medium'"
        ))
    if 'position' not in task_columns:
        db.session.execute(text(
            "ALTER TABLE tasks ADD COLUMN position INTEGER NOT NULL DEFAULT 0"
        ))
    db.session.commit()


# ============ AUTH ROUTES ============

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user"""
    data = request.get_json()
    
    # Validation
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400

    email = data['email'].strip().lower()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create user
    user = User(
        username=data['username'],
        email=email,
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return JWT"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400

    email = data['email'].strip().lower()
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    }), 200


@app.route('/api/auth/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update the authenticated user's profile details."""
    user = User.query.get(int(get_jwt_identity()))
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()

    if not username or not email:
        return jsonify({'error': 'Username and email are required'}), 400
    if User.query.filter(User.username == username, User.id != user.id).first():
        return jsonify({'error': 'Username already exists'}), 409
    if User.query.filter(User.email == email, User.id != user.id).first():
        return jsonify({'error': 'Email already exists'}), 409

    user.username = username
    user.email = email
    db.session.commit()
    return jsonify({'user': user.to_dict()}), 200


# ============ PROJECT ROUTES ============

@app.route('/api/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects for the current user with pagination"""
    user_id = int(get_jwt_identity())
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    projects = Project.query.filter_by(owner_id=user_id).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'projects': [{**project_payload(p),
            'task_statuses': [task.status for task in p.tasks]
        } for p in projects.items],
        'pagination': {
            'total': projects.total,
            'pages': projects.pages,
            'current_page': page,
            'per_page': per_page
        }
    }), 200


@app.route('/api/projects/search', methods=['GET'])
@jwt_required()
def search_projects():
    """Rank the current user's projects against a natural-language query."""
    user_id = int(get_jwt_identity())
    query = request.args.get('q', '').strip()

    if not query:
        return jsonify({'projects': []}), 200

    terms = [term.lower() for term in query.split() if len(term) > 1]
    projects = Project.query.filter_by(owner_id=user_id).all()
    ranked_projects = []

    for project in projects:
        project_text = f'{project.name} {project.description or ""}'.lower()
        task_text = ' '.join(
            f'{task.title} {task.description or ""} {task.status}'
            for task in project.tasks
        ).lower()
        score = 0
        matched_terms = []

        for term in terms:
            if term in project.name.lower():
                score += 5
                matched_terms.append(term)
            elif term in project_text:
                score += 3
                matched_terms.append(term)
            elif term in task_text:
                score += 2
                matched_terms.append(term)

        if score:
            project_data = project.to_dict()
            project_data['task_statuses'] = [task.status for task in project.tasks]
            project_data['match_reason'] = (
                f"Matched {', '.join(dict.fromkeys(matched_terms))} "
                'in the project or its tasks.'
            )
            project_data['relevance_score'] = score
            ranked_projects.append(project_data)

    ranked_projects.sort(key=lambda project: project['relevance_score'], reverse=True)
    return jsonify({'projects': ranked_projects, 'query': query}), 200


@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def dashboard_summary():
    """Return productivity metrics for the current user's dashboard."""
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(owner_id=user_id).all()
    tasks = [task for project in projects for task in project.tasks]
    now = datetime.utcnow()
    open_tasks = [task for task in tasks if task.status != 'completed']
    overdue_tasks = [
        task for task in open_tasks
        if task.due_date and task.due_date < now
    ]
    upcoming_tasks = sorted(
        [task for task in open_tasks if task.due_date and task.due_date >= now],
        key=lambda task: task.due_date
    )[:5]
    recent_activity = [
        {
            'id': f'project-{project.id}',
            'type': 'project_created',
            'title': project.name,
            'project_id': project.id,
            'timestamp': project.created_at.isoformat(),
        }
        for project in projects
    ]
    recent_activity.extend(
        {
            'id': f'task-{task.id}',
            'type': 'task_created',
            'title': task.title,
            'project_id': task.project_id,
            'project_name': task.project.name,
            'timestamp': task.created_at.isoformat(),
        }
        for task in tasks
    )
    recent_activity.sort(key=lambda activity: activity['timestamp'], reverse=True)

    return jsonify({
        'projects': len(projects),
        'tasks': len(tasks),
        'completed_tasks': len([task for task in tasks if task.status == 'completed']),
        'overdue_tasks': len(overdue_tasks),
        'recent_activity': recent_activity[:8],
        'upcoming_tasks': [{
            'id': task.id,
            'title': task.title,
            'due_date': task.due_date.isoformat(),
            'project_id': task.project_id,
            'project_name': task.project.name
        } for task in upcoming_tasks]
    }), 200


@app.route('/api/assistant', methods=['POST'])
@jwt_required()
def project_assistant():
    """Answer simple productivity questions using the user's own project data."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    question = data.get('question', '').strip().lower()
    projects = Project.query.filter_by(owner_id=user_id).all()
    tasks = [task for project in projects for task in project.tasks]
    overdue = [
        task for task in tasks
        if task.status != 'completed' and task.due_date and task.due_date < datetime.utcnow()
    ]
    next_task = next(
        (task for task in sorted(tasks, key=lambda item: item.due_date or datetime.max)
         if task.status != 'completed'),
        None
    )

    if any(word in question for word in ['overdue', 'late', 'behind']):
        answer = (
            f'You have {len(overdue)} overdue task(s).'
            if overdue else 'You have no overdue open tasks.'
        )
    elif any(word in question for word in ['next', 'start', 'priority']):
        answer = (
            f"Start with '{next_task.title}' in {next_task.project.name}."
            if next_task else 'All of your tasks are complete.'
        )
    else:
        answer = (
            f'You have {len(projects)} project(s) and {len(tasks)} task(s), '
            f'with {len([task for task in tasks if task.status == "completed"])} completed. '
            'Ask me about overdue tasks or what to do next.'
        )

    return jsonify({'answer': answer}), 200


@app.route('/api/assistant/suggestions', methods=['GET'])
@jwt_required()
def assistant_suggestions():
    """Generate actionable task suggestions from the user's current workload."""
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(owner_id=user_id).all()
    tasks = [task for project in projects for task in project.tasks if task.status != 'completed']
    priority_rank = {'high': 0, 'medium': 1, 'low': 2}
    tasks.sort(key=lambda task: (priority_rank.get(task.priority, 1), task.due_date or datetime.max))
    suggestions = [
        {'title': task.title, 'reason': f'{task.priority.title()} priority in {task.project.name}', 'project_id': task.project_id}
        for task in tasks[:3]
    ]
    if not suggestions:
        suggestions = [{'title': 'Plan your next project milestone', 'reason': 'Your current task list is clear.', 'project_id': None}]
    return jsonify({'suggestions': suggestions}), 200


@app.route('/api/projects', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Project name is required'}), 400
    
    project = Project(
        name=data['name'],
        description=data.get('description', ''),
        priority=data.get('priority', 'medium'),
        due_date=parse_datetime(data.get('due_date')),
        owner_id=user_id
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project created successfully',
        'project': project_payload(project)
    }), 201


@app.route('/api/projects/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get a specific project"""
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Authorization check
    if project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'priority': project.priority,
        'due_date': project.due_date.isoformat() if project.due_date else None,
        'owner_id': project.owner_id,
        'created_at': project.created_at.isoformat(),
        'tasks': [{
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'priority': t.priority,
            'due_date': t.due_date.isoformat() if t.due_date else None,
            'position': t.position,
            'created_at': t.created_at.isoformat()
        } for t in project.tasks]
    }), 200


@app.route('/api/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update a project"""
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Authorization check
    if project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        project.name = data['name']
    if 'description' in data:
        project.description = data['description']
    if 'priority' in data:
        project.priority = data['priority']
    if 'due_date' in data:
        project.due_date = parse_datetime(data['due_date'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Project updated successfully',
        'project': project_payload(project)
    }), 200


@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete a project"""
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Authorization check
    if project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Delete associated tasks
    Task.query.filter_by(project_id=project_id).delete()
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'message': 'Project deleted successfully'}), 200


# ============ TASK ROUTES ============

@app.route('/api/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_tasks(project_id):
    """Get all tasks for a project with pagination"""
    user_id = int(get_jwt_identity())
    
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Authorization check
    if project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    tasks = Task.query.filter_by(project_id=project_id).order_by(Task.position, Task.created_at).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'tasks': [task_payload(t) for t in tasks.items],
        'pagination': {
            'total': tasks.total,
            'pages': tasks.pages,
            'current_page': page,
            'per_page': per_page
        }
    }), 200


@app.route('/api/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    """Create a new task in a project"""
    user_id = int(get_jwt_identity())
    
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Authorization check
    if project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({'error': 'Task title is required'}), 400
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'pending'),
        priority=data.get('priority', 'medium'),
        due_date=parse_datetime(data.get('due_date')),
        position=Task.query.filter_by(project_id=project_id).count(),
        project_id=project_id
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'message': 'Task created successfully',
        'task': task_payload(task)
    }), 201


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Get a specific task"""
    user_id = int(get_jwt_identity())
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Authorization check
    if task.project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    return jsonify(task_payload(task)), 200


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update a task"""
    user_id = int(get_jwt_identity())
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Authorization check
    if task.project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        task.status = data['status']
    if 'priority' in data:
        task.priority = data['priority']
    if 'due_date' in data:
        task.due_date = parse_datetime(data['due_date'])
    
    db.session.commit()
    
    return jsonify({'message': 'Task updated successfully', 'task': task_payload(task)}), 200


@app.route('/api/projects/<int:project_id>/tasks/reorder', methods=['PUT'])
@jwt_required()
def reorder_tasks(project_id):
    """Persist the order of tasks after a drag-and-drop operation."""
    user_id = int(get_jwt_identity())
    project = Project.query.get(project_id)
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    if project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    task_ids = (request.get_json() or {}).get('task_ids', [])
    tasks = {task.id: task for task in project.tasks}
    if len(task_ids) != len(tasks) or set(task_ids) != set(tasks):
        return jsonify({'error': 'task_ids must contain every project task exactly once'}), 400
    for position, task_id in enumerate(task_ids):
        tasks[task_id].position = position
    db.session.commit()
    return jsonify({'tasks': [task_payload(task) for task in sorted(tasks.values(), key=lambda item: item.position)]}), 200


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Delete a task"""
    user_id = int(get_jwt_identity())
    
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    # Authorization check
    if task.project.owner_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully'}), 200


# ============ HEALTH CHECK ============

@app.route('/', methods=['GET'])
def index():
    return jsonify({'message': 'Productivity API is running'}), 200


# ============ ERROR HANDLERS ============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        ensure_project_columns()
    app.run(host='0.0.0.0', port=5000, debug=False)
