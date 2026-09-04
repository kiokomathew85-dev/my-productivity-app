import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TaskItem from '../components/TaskItem';
import { projectAPI, taskAPI } from '../services/api';
import '../styles/ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('pending');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');

  const perPage = 10;

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const projectResponse = await projectAPI.getById(id);
      setProject(projectResponse.data);
      setEditName(projectResponse.data.name);
      setEditDesc(projectResponse.data.description);
      setEditPriority(projectResponse.data.priority || 'medium');
      setEditDueDate(projectResponse.data.due_date ? projectResponse.data.due_date.slice(0, 10) : '');

      const tasksResponse = await taskAPI.getByProject(id, page, perPage);
      setTasks(tasksResponse.data.tasks);
      setTotalPages(tasksResponse.data.pagination.pages);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this project.');
      } else {
        setError('Failed to fetch project details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, page]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetchProjectAndTasks();
  }, [fetchProjectAndTasks, navigate]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setCreatingTask(true);
      await taskAPI.create(id, newTaskTitle, newTaskDesc, newTaskStatus, newTaskDueDate || null, newTaskPriority);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskStatus('pending');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setPage(1);
      await fetchProjectAndTasks();
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      await projectAPI.update(id, editName, editDesc, editPriority, editDueDate || null);
      setProject({ ...project, name: editName, description: editDesc, priority: editPriority, due_date: editDueDate || null });
      setEditingProject(false);
      setError('');
    } catch (err) {
      setError('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project and all its tasks?')) {
      try {
        await projectAPI.delete(id);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete project. Please try again.');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      await taskAPI.update(taskId, updatedData.title, updatedData.description, updatedData.status, updatedData.due_date, updatedData.priority);
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, ...updatedData } : t
      );
      setTasks(updatedTasks);
      setError('');
    } catch (err) {
      setError('Failed to update task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="project-detail">
        <Navbar />
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail">
        <Navbar />
        <div className="error-message">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="project-detail">
      <Navbar />

      <div className="project-detail-container">
        {error && <div className="error-message">{error}</div>}

        <div className="project-header">
          {editingProject ? (
            <div className="edit-project">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows="2"
              />
              <div className="form-row"><label>Priority<select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} /></label></div>
              <div className="button-group">
                <button onClick={handleUpdateProject}>Save</button>
                <button onClick={() => setEditingProject(false)} className="secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="project-info">
              <h1>{project.name}</h1>
              <p className="description">{project.description}</p>
              <p className="project-meta"><span className={`priority priority-${project.priority || 'medium'}`}>{project.priority || 'medium'} priority</span>{project.due_date && ` Due ${new Date(project.due_date).toLocaleDateString()}`}</p>
              <div className="project-actions">
                <button onClick={() => setEditingProject(true)} className="secondary">
                  Edit Project
                </button>
                <button onClick={handleDeleteProject} className="danger">
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="create-task-section">
          <h2>Add New Task</h2>
          <form onSubmit={handleCreateTask} className="create-task-form">
            <input
              type="text"
              placeholder="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={creatingTask}
              required
            />
            <textarea
              placeholder="Task Description (optional)"
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              disabled={creatingTask}
              rows="2"
            />
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
              disabled={creatingTask}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="form-row"><label>Priority<select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} disabled={creatingTask}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} disabled={creatingTask} /></label></div>
            <button type="submit" disabled={creatingTask}>
              {creatingTask ? 'Creating...' : 'Add Task'}
            </button>
          </form>
        </div>

        <div className="tasks-section">
          <h2>Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks yet. Create one to get started!</p>
            </div>
          ) : (
            <>
              <div className="tasks-list">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onUpdate={handleUpdateTask}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    ← Previous
                  </button>
                  <span>Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="back-link">
          <a href="/dashboard">← Back to Projects</a>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
