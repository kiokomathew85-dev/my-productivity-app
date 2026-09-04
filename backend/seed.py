from app import app
from models import db, User, Project, Task
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta


def seed_data():
    """Populate the database with seed data for testing"""
    with app.app_context():
        db.create_all()

        # Check if data already exists
        if User.query.first():
            print('Database already contains data. Skipping seed.')
            return

        # Create test users
        user1 = User(
            username='alice',
            email='alice@example.com',
            password_hash=generate_password_hash('password123')
        )
        user2 = User(
            username='bob',
            email='bob@example.com',
            password_hash=generate_password_hash('password456')
        )

        db.session.add_all([user1, user2])
        db.session.commit()

        # Create projects for user1
        project1 = Project(
            name='Website Redesign',
            description='Complete overhaul of company website with new branding',
            owner_id=user1.id
        )
        project2 = Project(
            name='Mobile App MVP',
            description='Build minimum viable product for iOS and Android',
            owner_id=user1.id
        )

        # Create projects for user2
        project3 = Project(
            name='Data Migration',
            description='Migrate customer data from legacy system to new platform',
            owner_id=user2.id
        )

        db.session.add_all([project1, project2, project3])
        db.session.commit()

        # Create tasks for project1
        now = datetime.utcnow()
        task1 = Task(
            title='Create design mockups',
            description='Design wireframes and high-fidelity mockups for all pages',
            status='completed',
            due_date=now - timedelta(days=5),
            project_id=project1.id
        )
        task2 = Task(
            title='Implement responsive layout',
            description='Build responsive CSS for mobile, tablet, and desktop',
            status='in_progress',
            due_date=now + timedelta(days=3),
            project_id=project1.id
        )
        task3 = Task(
            title='Integration testing',
            description='Test all pages and functionality across browsers',
            status='pending',
            due_date=now + timedelta(days=7),
            project_id=project1.id
        )

        # Create tasks for project2
        task4 = Task(
            title='Setup project structure',
            description='Initialize React Native project with necessary packages',
            status='completed',
            due_date=now - timedelta(days=10),
            project_id=project2.id
        )
        task5 = Task(
            title='Build authentication flow',
            description='Implement login, signup, and password reset features',
            status='in_progress',
            due_date=now + timedelta(days=5),
            project_id=project2.id
        )
        task6 = Task(
            title='User dashboard screen',
            description='Create main dashboard with user stats and navigation',
            status='pending',
            due_date=now + timedelta(days=10),
            project_id=project2.id
        )

        # Create tasks for project3
        task7 = Task(
            title='Extract data from legacy system',
            description='Query and export data from old PostgreSQL database',
            status='in_progress',
            due_date=now + timedelta(days=2),
            project_id=project3.id
        )
        task8 = Task(
            title='Validate data integrity',
            description='Verify all records match between systems',
            status='pending',
            due_date=now + timedelta(days=5),
            project_id=project3.id
        )
        task9 = Task(
            title='Deploy to production',
            description='Switch over to new system and monitor for issues',
            status='pending',
            due_date=now + timedelta(days=7),
            project_id=project3.id
        )

        db.session.add_all([
            task1, task2, task3, task4, task5, task6, task7, task8, task9
        ])
        db.session.commit()

        print('Seed data added successfully!')
        print(f'  - Created {User.query.count()} users')
        print(f'  - Created {Project.query.count()} projects')
        print(f'  - Created {Task.query.count()} tasks')


if __name__ == '__main__':
    seed_data()
