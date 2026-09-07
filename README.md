# Productivity App

A full-stack productivity management application built with React, Flask, and PostgreSQL. The application allows authenticated users to create and manage projects, organize tasks within those projects, track task progress, and manage their personal productivity through a secure and responsive interface.

## Project Overview

The Productivity App is designed to help users organize their daily work by separating their goals and activities into projects and tasks.

Each authenticated user has ownership of their own projects and tasks. The application uses JWT-based authentication and authorization to ensure that users can only access, modify, and delete records that belong to them.

The application demonstrates full-stack development concepts including RESTful API design, relational database modeling, authentication, authorization, CRUD operations, pagination, frontend state management, and responsive user interface development.

## Project Goals

The main goals of the application are to:

* Provide users with a simple way to organize their work.
* Allow users to create and manage multiple projects.
* Allow users to create and manage tasks within individual projects.
* Track task progress using different statuses.
* Protect user information through authentication and authorization.
* Ensure users can only access and modify their own records.
* Provide a responsive interface that works across different screen sizes.
* Demonstrate communication between a React frontend and Flask REST API.

## Core Features

### User Authentication

The application provides secure user authentication using JSON Web Tokens.

Users can:

* Create an account.
* Log in with their credentials.
* Access protected application features after authentication.
* Maintain an authenticated session using a JWT token.
* Log out of the application.
* Access their own user information.

Passwords are securely hashed before being stored in the database.

### Project Management

Authenticated users can manage their own projects.

Project functionality includes:

* Create a project.
* View projects.
* View individual project details.
* Update project information.
* Delete projects.
* Add descriptions to projects.
* View the tasks associated with a project.
* Track the number of tasks associated with a project.

### Task Management

Tasks are relationally connected to projects.

Users can:

* Create tasks within a project.
* View tasks belonging to a project.
* View individual tasks.
* Update task information.
* Change task status.
* Delete tasks.
* Add task descriptions.
* Set optional due dates.

Task statuses include:

* Pending
* In Progress
* Completed

### Authorization and Data Ownership

The application enforces ownership-based access control.

A user can only:

* View their own projects.
* Create projects for their own account.
* Update their own projects.
* Delete their own projects.
* View tasks belonging to their own projects.
* Create tasks within their own projects.
* Update their own tasks.
* Delete their own tasks.

Protected API routes require valid authentication before allowing users to access or modify protected resources.

### Pagination

Pagination is implemented for relevant collection endpoints to make the application more efficient when handling larger amounts of data.

Supported requests can use parameters such as:

```text
?page=1&per_page=10
```

This allows the frontend to retrieve records in manageable sections rather than loading all records at once.

## Technologies Used

### Frontend

* React 18
* React Router
* Axios
* JavaScript
* CSS3
* HTML5

### Backend

* Python
* Flask
* Flask-SQLAlchemy
* Flask-JWT-Extended
* Flask-CORS
* Werkzeug
* python-dotenv

### Database

* PostgreSQL
* SQLite for local development

### Development Tools

* Git
* GitHub
* Node.js
* npm
* Python virtual environments

## Application Architecture

The project follows a full-stack architecture consisting of a React frontend, Flask REST API, and relational database.

```text
User
 |
 v
React Frontend
 |
 | HTTP Requests
 v
Flask REST API
 |
 | SQLAlchemy
 v
PostgreSQL / SQLite
```

The frontend is responsible for the user interface, application state, navigation, forms, and communication with the backend API.

The backend handles authentication, authorization, business logic, validation, database operations, and RESTful API responses.

The database stores users, projects, and tasks using relational models.

## Project Structure

```text
my-productivity-app/
|
├── api/
|
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models.py
│   ├── seed.py
│   ├── requirements.txt
│   └── migrations/
|
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── ProjectCard.js
│   │   │   ├── TaskItem.js
│   │   │   └── Sidebar.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   └── ProjectDetail.js
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── styles/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── package.json
│   └── .env.example
|
├── .gitignore
├── .python-version
├── DEPLOYMENT.md
├── PRESENTATION.md
├── requirements.txt
├── vercel.json
├── package-lock.json
└── README.md
```

## Database Models

The application uses three main relational resources.

### User

The User model represents registered users.

Fields include:

* `id`
* `username`
* `email`
* `password_hash`
* `created_at`

### Project

The Project model represents a user's individual projects.

Fields include:

* `id`
* `name`
* `description`
* `owner_id`
* `created_at`

Each project belongs to a specific user.

### Task

The Task model represents individual tasks within a project.

Fields include:

* `id`
* `title`
* `description`
* `status`
* `due_date`
* `project_id`
* `created_at`

Each task belongs to a specific project.

The relationship between the resources can be represented as:

```text
User
 |
 | 1-to-many
 v
Projects
 |
 | 1-to-many
 v
Tasks
```

## REST API

### Authentication

```text
POST /api/auth/signup
```

Creates a new user account.

```text
POST /api/auth/login
```

Authenticates a user and returns a JWT token.

```text
GET /api/auth/me
```

Returns information about the currently authenticated user.

### Projects

```text
GET /api/projects
```

Returns the authenticated user's projects.

```text
POST /api/projects
```

Creates a new project.

```text
GET /api/projects/<id>
```

Returns a specific project and its associated tasks.

```text
PUT /api/projects/<id>
```

Updates a project.

```text
DELETE /api/projects/<id>
```

Deletes a project and its associated tasks.

### Tasks

```text
GET /api/projects/<project_id>/tasks
```

Returns tasks belonging to a project.

```text
POST /api/projects/<project_id>/tasks
```

Creates a new task within a project.

```text
GET /api/tasks/<id>
```

Returns a specific task.

```text
PUT /api/tasks/<id>
```

Updates a task.

```text
DELETE /api/tasks/<id>
```

Deletes a task.

## Authentication Flow

The authentication process works as follows:

1. A user creates an account through the signup page.
2. The backend validates the submitted information.
3. The user's password is securely hashed.
4. The user logs in using their email and password.
5. The backend verifies the credentials.
6. A JWT token is generated.
7. The frontend stores the authentication token.
8. The token is included in requests to protected API endpoints.
9. The backend validates the token before allowing access.
10. Ownership checks ensure that users can only access their own records.

Example authorization header:

```text
Authorization: Bearer <jwt-token>
```

## Installation and Setup

### Prerequisites

Make sure the following are installed:

* Python 3.8 or higher
* Node.js 14 or higher
* npm
* Git
* PostgreSQL, if using PostgreSQL locally

### Clone the Repository

```bash
git clone https://github.com/kiokomathew85-dev/my-productivity-app.git
cd my-productivity-app
```

### Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

On macOS or Linux:

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=sqlite:///app.db
FLASK_ENV=development
```

For PostgreSQL, replace the database URL with your PostgreSQL connection string.

Do not commit real passwords, secret keys, API keys, or database credentials to GitHub.

### Initialize the Database

Run the database seed script if your project uses the included seed data:

```bash
python seed.py
```

### Start the Backend

```bash
python app.py
```

The Flask API will normally run at:

```text
http://localhost:5000
```

## Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the required environment file if needed:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the React application:

```bash
npm start
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Testing the Application

The following functionality should be tested before submission.

### Authentication

* Register a new user.
* Log in with valid credentials.
* Attempt login with invalid credentials.
* Verify protected pages cannot be accessed without authentication.
* Log out successfully.
* Verify authenticated requests contain the required JWT.

### Projects

* Create a project.
* View projects.
* View a project.
* Edit a project.
* Delete a project.
* Verify deleted projects no longer appear.

### Tasks

* Create a task.
* View tasks.
* Edit task details.
* Change task status.
* Delete a task.
* Verify tasks are correctly associated with projects.

### Ownership

Test with multiple user accounts and confirm:

* User A cannot access User B's projects.
* User A cannot edit User B's projects.
* User A cannot delete User B's projects.
* User A cannot access User B's tasks.
* User A cannot edit User B's tasks.
* User A cannot delete User B's tasks.

### Pagination

Verify that collection endpoints correctly respond to pagination parameters:

```text
?page=1&per_page=10
```

Test multiple pages and different page sizes.

## Error Handling

The application should provide appropriate responses for common errors, including:

* Invalid login credentials.
* Missing authentication token.
* Expired or invalid JWT tokens.
* Unauthorized resource access.
* Invalid request data.
* Missing projects.
* Missing tasks.
* Database errors.

The frontend provides appropriate feedback when API requests fail or when data is being loaded.

## Responsive Design

The frontend is designed to work across:

* Desktop computers
* Laptops
* Tablets
* Mobile devices

The interface uses responsive CSS and reusable React components to maintain a consistent user experience across different screen sizes.

## Git and Version Control

The project is maintained using Git and GitHub.

Development follows standard Git practices:

```bash
git add .
git commit -m "Describe the changes"
git push origin main
```

The repository should contain meaningful commits that demonstrate incremental development.

The `.gitignore` file is configured to prevent unnecessary and sensitive files from being committed, including environment files, virtual environments, dependencies, and generated files.

## Deployment

The application can be deployed using platforms such as:

* Vercel
* Render
* Netlify
* Other compatible hosting services

Before deployment, configure all required environment variables on the hosting platform.

For production deployment, the frontend API URL must point to the deployed Flask backend rather than the local development server.

Deployment instructions are also provided in:

```text
DEPLOYMENT.md
```

## Future Improvements

Potential future improvements include:

* User dashboard with productivity statistics.
* Search and filtering for projects and tasks.
* Task priority levels.
* Task categories.
* Notifications and reminders.
* Calendar integration.
* Dark mode.
* External API integrations.
* AI-assisted task categorization or summarization.
* More detailed productivity reports.

## Project Requirements Coverage

This project addresses the major requirements of the Full-Stack Application assignment.

| Requirement              | Implementation                 |
| ------------------------ | ------------------------------ |
| React frontend           | React application              |
| Flask backend            | Flask REST API                 |
| Relational database      | PostgreSQL / SQLite            |
| User authentication      | JWT authentication             |
| Authorization            | Ownership-based access control |
| Two relational resources | Projects and Tasks             |
| Full CRUD                | Projects and Tasks             |
| Pagination               | Paginated GET requests         |
| RESTful API              | Structured API endpoints       |
| GitHub repository        | Public GitHub repository       |
| README documentation     | This document                  |
| Responsive interface     | Responsive React frontend      |

## Author

Mathew Kioko

Full-Stack Development Student

Moringa School

## License

This project was created for educational purposes as part of the Moringa School Full-Stack Development course.

## Repository

GitHub Repository:

https://github.com/kiokomathew85-dev/my-productivity-app
