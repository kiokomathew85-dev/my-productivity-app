<<<<<<< HEAD
# Productivity App

A full-stack web application for managing projects and tasks. Built with Flask, PostgreSQL, and React, this app helps users organize their work and track progress on multiple projects with intuitive task management features.

## 🎯 Overview

The Productivity App is a personal project management tool that enables users to:
- **Create and manage projects** - Organize work into separate projects with descriptions
- **Manage tasks** - Add, edit, and track tasks within each project
- **Track task status** - Monitor progress with task status (pending, in_progress, completed)
- **Secure authentication** - User registration and login with JWT token-based authentication
- **Data ownership** - Ensure users can only access and modify their own data
- **Pagination** - Browse large lists of projects and tasks efficiently

## 🛠️ Technologies Used

### Backend
- **Flask** - Python web framework for building the REST API
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-JWT-Extended** - JWT token-based authentication
- **PostgreSQL** - Relational database (or SQLite for development)
- **Flask-CORS** - Enable cross-origin requests from frontend
- **Werkzeug** - Password hashing and security utilities
- **python-dotenv** - Environment variable management

### Frontend
- **React 18** - UI library for building dynamic user interfaces
- **React Router v6** - Client-side routing for navigation
- **Axios** - HTTP client for API requests
- **CSS3** - Styling and responsive design

## 📋 Project Structure

```
my-productivity-app/
├── backend/
│   ├── app.py              # Main Flask application with all routes
│   ├── config.py           # Configuration settings
│   ├── models.py           # SQLAlchemy models (User, Project, Task)
│   ├── seed.py             # Database seeding with demo data
│   ├── requirements.txt    # Python dependencies
│   └── migrations/         # Flask-Migrate database migrations
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Navbar.js
│   │   │   ├── ProjectCard.js
│   │   │   ├── TaskItem.js
│   │   │   └── Sidebar.js
│   │   ├── pages/          # Page components
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   └── ProjectDetail.js
│   │   ├── services/       # API integration
│   │   │   └── api.js
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json        # Frontend dependencies
│   └── .env.example        # Example environment variables
├── .gitignore
├── README.md
└── requirements.txt
```

## 🚀 Setup and Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- PostgreSQL (optional, SQLite used for development)
- pip and npm package managers

### Backend Setup

1. **Create a virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env  # If .env.example exists, or create manually
   
   # Edit .env with your settings:
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-here
   DATABASE_URL=sqlite:///app.db  # or PostgreSQL connection string
   FLASK_ENV=development
   ```

4. **Initialize the database:**
   ```bash
   python seed.py
   ```
   This will create tables and populate with sample data.

5. **Run the Flask server:**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (optional):**
   ```bash
   # Create .env file in frontend directory
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current authenticated user (requires token)

### Projects
- `GET /api/projects` - List all user projects (paginated)
- `POST /api/projects` - Create a new project
- `GET /api/projects/<id>` - Get a specific project with all tasks
- `PUT /api/projects/<id>` - Update a project
- `DELETE /api/projects/<id>` - Delete a project and its tasks

### Tasks
- `GET /api/projects/<project_id>/tasks` - List tasks for a project (paginated)
- `POST /api/projects/<project_id>/tasks` - Create a task in a project
- `GET /api/tasks/<id>` - Get a specific task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task

## 🔐 Authentication & Authorization

The app uses **JWT (JSON Web Token)** based authentication:

1. **Registration/Login**: Users provide email and password
2. **Token Generation**: Server returns a JWT token upon successful authentication
3. **Protected Routes**: All API routes (except auth) require a valid JWT in the Authorization header
4. **Authorization**: Users can only access and modify their own data - the backend verifies ownership

**Example Authorization Header:**
```
Authorization: Bearer your_jwt_token_here
```

## 💾 Database Models

### User
- `id` - Primary key
- `username` - Unique username
- `email` - Unique email
- `password_hash` - Hashed password
- `created_at` - Account creation timestamp

### Project
- `id` - Primary key
- `name` - Project name
- `description` - Project description
- `owner_id` - Foreign key to User
- `created_at` - Creation timestamp
- `tasks` - Relationship to Task objects

### Task
- `id` - Primary key
- `title` - Task title
- `description` - Task description
- `status` - Task status (pending, in_progress, completed)
- `due_date` - Optional due date
- `project_id` - Foreign key to Project
- `created_at` - Creation timestamp

## 🎨 Core Features

### 1. User Authentication
- Secure signup and login
- JWT token-based authentication
- Password hashing with Werkzeug
- Logout functionality

### 2. Project Management
- Create projects with name and description
- View all user projects in a paginated grid
- Edit project details
- Delete projects (also removes associated tasks)
- See task count for each project

### 3. Task Management
- Create tasks within projects
- Edit task title, description, and status
- Delete tasks
- Track task status: Pending → In Progress → Completed
- View all tasks for a project
- Pagination support for task lists

### 4. User Experience
- Responsive design for mobile and desktop
- Real-time form validation
- Error handling and user feedback
- Loading states during API calls
- Navigation with React Router
- Persistent authentication with localStorage

## 📖 Usage Example

### Creating a Project
1. Log in with your credentials
2. Click on the Dashboard link in the navbar
3. Fill in the "Create New Project" form
4. Click "Create Project"

### Managing Tasks
1. Navigate to a project by clicking "View Project"
2. Fill in the "Add New Task" form
3. Click "Add Task"
4. Edit tasks by clicking the "Edit" button
5. Change status using the dropdown in edit mode
6. Delete tasks using the "Delete" button

## 🧪 Testing

### Test Credentials (from seed data)
```
User 1:
Email: alice@example.com
Password: password123

User 2:
Email: bob@example.com
Password: password456
```

### Manual Testing Checklist
- [ ] Sign up with new account
- [ ] Log in with credentials
- [ ] Create a new project
- [ ] Create tasks within a project
- [ ] Edit task status to "in_progress"
- [ ] Edit task status to "completed"
- [ ] Update task details
- [ ] Delete a task
- [ ] Edit project details
- [ ] Delete a project
- [ ] Test pagination on projects list
- [ ] Test pagination on tasks list
- [ ] Log out and verify redirect to login
- [ ] Verify users can only see their own projects

## 🌐 Deployment (Optional)

### Deploy Backend (Render, Heroku, etc.)
1. Push code to GitHub
2. Connect repository to deployment service
3. Set environment variables (SECRET_KEY, DATABASE_URL, JWT_SECRET_KEY)
4. Deploy and configure database

### Deploy Frontend (Netlify, Vercel, etc.)
1. Build the React app: `npm run build`
2. Deploy the build folder to hosting service
3. Configure REACT_APP_API_URL to point to deployed backend

## 🐛 Troubleshooting

### CORS Errors
- Ensure Flask-CORS is properly configured in backend
- Check that frontend API URL matches backend URL

### Authentication Issues
- Verify JWT token is being stored and sent with requests
- Check token expiration settings
- Clear localStorage if token becomes corrupted

### Database Errors
- Run seed.py to reinitialize database
- Check DATABASE_URL configuration
- Ensure PostgreSQL is running if using PostgreSQL

## 📝 Git Workflow

The project follows best practices:
- Clear commit history showing incremental development
- Meaningful commit messages
- .gitignore properly configured
- No credentials or sensitive data in version control

## 🤝 Contributing

When adding features:
1. Create a feature branch
2. Make changes with clear commit messages
3. Test thoroughly
4. Submit pull request with description

## 📄 License

This project is created for educational purposes.

## 👤 Author

Created as a final project for Moringa School Full-Stack Development Course.

---

For more information or issues, please check the GitHub repository.
=======
# my-productivity-app
>>>>>>> origin/main
