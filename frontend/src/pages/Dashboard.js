import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import { dashboardAPI, projectAPI } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [notificationProjects, setNotificationProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState('medium');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [summary, setSummary] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const navigate = useNavigate();

  const perPage = 9;

  const fetchSummary = useCallback(async () => {
    try {
      const [summaryResponse, projectsResponse] = await Promise.all([
        dashboardAPI.getSummary(),
        projectAPI.getAll(1, 100),
      ]);
      setSummary(summaryResponse.data);
      setNotificationProjects(projectsResponse.data.projects);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectAPI.getAll(page, perPage);
      setProjects(response.data.projects);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      console.error('Error fetching projects:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else {
        setError('Failed to fetch projects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    fetchProjects();
    fetchSummary();
  }, [fetchProjects, fetchSummary, navigate]);

  const handleSearch = async (e, queryOverride = searchQuery) => {
    e.preventDefault();
    const query = queryOverride.trim();

    if (!query) {
      clearSearch();
      return;
    }

    try {
      setSearching(true);
      setError('');
      const response = await projectAPI.search(query);
      setProjects(response.data.projects);
      setSearchMode(true);
    } catch (err) {
      setError('Failed to search projects. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchMode(false);
    setStatusFilter('all');
    setSortBy('relevance');
    setPage(1);
    fetchProjects();
  };

  const focusSection = (selector, focusSelector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (focusSelector) {
      window.setTimeout(() => document.querySelector(focusSelector)?.focus(), 300);
    }
  };

  const handleNavigation = (destination) => {
    if (destination === 'settings') {
      navigate('/settings');
      return;
    }

    navigate('/dashboard');
    if (destination === 'projects') focusSection('#projects-section');
    if (destination === 'tasks') focusSection('.upcoming-section, #projects-section');
  };

  const visibleProjects = [...projects]
    .filter((project) => {
      if (statusFilter === 'all') return true;
      return project.task_statuses?.includes(statusFilter);
    })
    .sort((first, second) => {
      if (sortBy === 'name') return first.name.localeCompare(second.name);
      if (sortBy === 'tasks') return second.task_count - first.task_count;
      if (sortBy === 'recent') return new Date(second.created_at) - new Date(first.created_at);
      return (second.relevance_score || 0) - (first.relevance_score || 0);
    });

  const pendingProjects = notificationProjects.filter((project) => (project.progress || 0) < 100);
  const notificationCount = (summary?.overdue_tasks || 0)
    + (summary?.upcoming_tasks?.length || 0)
    + notificationProjects.length;

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setCreatingProject(true);
      await projectAPI.create(newProjectName, newProjectDesc, newProjectPriority, newProjectDueDate || null);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectPriority('medium');
      setNewProjectDueDate('');
      setPage(1);
      await fetchProjects();
      await fetchSummary();
    } catch (err) {
      setError('Failed to create project. Please try again.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(projectId);
        setProjects(projects.filter((p) => p.id !== projectId));
        setNotificationProjects(notificationProjects.filter((project) => project.id !== projectId));
      } catch (err) {
        setError('Failed to delete project. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-logo">M</div>
          <nav className="sidebar-nav" aria-label="Sidebar navigation">
            <button type="button" className="nav-item active" onClick={() => handleNavigation('dashboard')}>Dashboard</button>
            <button type="button" className="nav-item" onClick={() => handleNavigation('projects')}>Projects</button>
            <button type="button" className="nav-item" onClick={() => handleNavigation('tasks')}>Tasks</button>
            <button type="button" className="nav-item" onClick={() => focusSection('#projects-section')}>Reports</button>
            <button type="button" className="nav-item" onClick={() => handleNavigation('settings')}>Settings</button>
          </nav>
        </aside>

        <main className="dashboard-main">
          <header className="main-topbar">
            <div>
              <p className="topbar-label">Dashboard</p>
              <h1>Project</h1>
            </div>

            <div className="topbar-actions">
              <div className="notification-wrap">
                <button
                  type="button"
                  className="notification-btn"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
                >
                  <span aria-hidden="true">&#128276;</span>
                  {notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}
                </button>

                {notificationsOpen && (
                  <div className="notification-panel" role="region" aria-label="Notifications">
                    <div className="notification-heading">
                      <strong>Notifications</strong>
                      <span>{notificationCount} total</span>
                    </div>

                    <div className="notification-filters" role="group" aria-label="Notification filters">
                      {['all', 'pending', 'projects'].map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          className={notificationFilter === filter ? 'selected' : ''}
                          aria-pressed={notificationFilter === filter}
                          onClick={() => setNotificationFilter(filter)}
                        >
                          {filter[0].toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>

                    {notificationFilter === 'pending' && pendingProjects.length === 0 ? (
                      <p className="notification-empty">No pending projects.</p>
                    ) : notificationFilter === 'projects' && notificationProjects.length === 0 ? (
                      <p className="notification-empty">No projects yet.</p>
                    ) : notificationFilter === 'all' && notificationCount === 0 ? (
                      <p className="notification-empty">You are all caught up.</p>
                    ) : (
                      <div className="notification-list">
                        {notificationFilter === 'all' && summary?.overdue_tasks > 0 && (
                          <div className="notification-item notification-alert">
                            <strong>{summary.overdue_tasks} overdue task{summary.overdue_tasks === 1 ? '' : 's'}</strong>
                            <small>Review your projects for missed deadlines.</small>
                          </div>
                        )}

                        {notificationFilter === 'all' && summary?.upcoming_tasks?.map((task) => (
                          <Link
                            key={task.id}
                            to={`/projects/${task.project_id}`}
                            className="notification-item"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            <strong>{task.title}</strong>
                            <small>{task.project_name} · Due {new Date(task.due_date).toLocaleDateString()}</small>
                          </Link>
                        ))}

                        {(notificationFilter === 'all' ? notificationProjects : notificationFilter === 'pending' ? pendingProjects : notificationProjects).map((project) => (
                          <Link
                            key={`project-${project.id}`}
                            to={`/projects/${project.id}`}
                            className="notification-item notification-project"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            <strong>{project.name}</strong>
                            <small>
                              {project.completed_count || 0}/{project.task_count || 0} tasks complete · {project.progress || 0}% · {project.priority || 'medium'} priority
                              {project.due_date && ` · Due ${new Date(project.due_date).toLocaleDateString()}`}
                            </small>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button type="button" className="ghost-btn" onClick={() => focusSection('.project-filter-form', '#project-search')}>Search</button>
              <button type="button" className="ghost-btn" onClick={() => focusSection('#create-project-form', '#new-project-name')}>+ New</button>
            </div>
          </header>

          <section className="project-toolbar-row">
            <form onSubmit={handleSearch} className="project-filter-form">
              <input
                id="project-search"
                type="search"
                aria-label="Search projects"
                placeholder="Search project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={searching}
              />
              <button type="submit" disabled={searching}>{searching ? '...' : 'Find'}</button>
            </form>

            <div className="control-wrap">
              <label>
                Status
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>

              <label>
                Sort
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevance">Best match</option>
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                  <option value="tasks">Tasks</option>
                </select>
              </label>
            </div>
          </section>

          {error && <div className="error-message">{error}</div>}

          <div id="projects-section">
            {loading ? (
              <div className="loading">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="no-projects">
                <p>{searchMode ? 'No projects matched that search.' : 'No projects yet. Create one to get started!'}</p>
              </div>
            ) : (
              <>
                {visibleProjects.length === 0 ? (
                  <div className="no-projects"><p>No projects match this filter.</p></div>
                ) : (
                  <div className="projects-grid">
                    {visibleProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
                    ))}
                  </div>
                )}

                {!searchMode && visibleProjects.length > 0 && (
                  <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>

          <form id="create-project-form" onSubmit={handleCreateProject} className="create-project-form">
            <h2>Create New Project</h2>
            <input
              id="new-project-name"
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              disabled={creatingProject}
            />
            <textarea
              placeholder="Description"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              disabled={creatingProject}
              rows="3"
            />
            <div className="form-row">
              <label>
                Priority
                <select value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.target.value)} disabled={creatingProject}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Due date
                <input type="date" value={newProjectDueDate} onChange={(e) => setNewProjectDueDate(e.target.value)} disabled={creatingProject} />
              </label>
            </div>
            <button type="submit" disabled={creatingProject}>{creatingProject ? 'Creating...' : 'Create Project'}</button>
          </form>

          {summary && summary.upcoming_tasks?.length > 0 && (
            <section className="upcoming-section" aria-label="Upcoming deadlines">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">UP NEXT</p>
                  <h2>Upcoming deadlines</h2>
                </div>
                <span>{summary.upcoming_tasks.length} open</span>
              </div>

              <div className="upcoming-list">
                {summary.upcoming_tasks.map((task) => (
                  <Link key={task.id} to={`/projects/${task.project_id}`} className="upcoming-item">
                    <span>{task.title}</span>
                    <small>{task.project_name} · {new Date(task.due_date).toLocaleDateString()}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
