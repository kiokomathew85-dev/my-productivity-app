# Productivity App
## A focused workspace for projects and tasks

**Presentation deck**

---

# 1. The Challenge

- Work is scattered across notes, chats, and disconnected tools
- Project priorities are difficult to see at a glance
- Task progress can be hard to track consistently
- Teams need a simple, focused workspace for execution

---

# 2. The Solution

## Productivity App

A full-stack project and task management application that brings planning, execution, and progress tracking into one clear workspace.

- Organize work into projects
- Break projects into actionable tasks
- Track status and priority
- Secure each user's data

---

# 3. Core Features

- User signup and login
- JWT-based authentication
- Create, edit, and delete projects
- Create, edit, and delete tasks
- Task statuses: pending, in progress, completed
- Priority and due-date tracking
- Project and task pagination
- Dashboard summary and assistant support

---

# 4. Typical User Flow

1. Create an account or sign in
2. Review the dashboard
3. Create a project with a priority and due date
4. Add tasks to the project
5. Update task status as work progresses
6. Review project progress and upcoming deadlines

---

# 5. How to Use It

## A simple workflow for every project

1. Open the app and sign up, or log in
2. From the dashboard, create a project
3. Add a project name, description, priority, and due date
4. Open the project and create tasks
5. Set each task's status, priority, and due date
6. Edit tasks as work changes, or mark them completed
7. Return to the dashboard to review overall progress

---

# 6. Product Experience

## Designed for clarity and momentum

- Dashboard for an at-a-glance overview
- Sidebar navigation for quick movement between areas
- Project detail view for focused execution
- Reusable task and project components
- Responsive React interface for modern browsers

---

# 7. Technology Architecture

```text
React frontend
      |
      | Axios REST requests
      v
Flask API on Vercel
      |
      v
SQLAlchemy data models
      |
      v
PostgreSQL production database
```

- Frontend: React 18, React Router, Axios, CSS
- Backend: Flask, SQLAlchemy, JWT, CORS
- Deployment: Vercel serverless Python API and static React build

---

# 8. Security and Deployment

- Passwords stored using secure hashing
- JWT tokens protect authenticated API routes
- Users can access only their own projects and tasks
- CORS enabled for frontend/API communication
- Production API uses same-origin `/api` routing
- Python 3.12 configured for Vercel compatibility
- PostgreSQL recommended for persistent production data

---

# 9. Roadmap

- Team collaboration and shared projects
- Notifications for approaching due dates
- Calendar and timeline views
- Drag-and-drop task organization
- Advanced reporting and productivity insights
- Automated testing and monitoring improvements

---

# Closing

## Plan clearly. Execute consistently. See progress.

**Productivity App**
