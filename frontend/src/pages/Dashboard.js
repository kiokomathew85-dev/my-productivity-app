import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import { dashboardAPI, projectAPI } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
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
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [askingAssistant, setAskingAssistant] = useState(false);
  const navigate = useNavigate();

  const perPage = 9;

  const fetchSummary = useCallback(async () => {
    try {
      const response = await dashboardAPI.getSummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    }
  }, []);

  const askAssistant = async (e) => {
    e.preventDefault();
    if (!assistantQuestion.trim()) return;

    try {
      setAskingAssistant(true);
      const response = await dashboardAPI.askAssistant(assistantQuestion);
      setAssistantAnswer(response.data.answer);
    } catch (err) {
      setAssistantAnswer('I could not read your project data right now.');
    } finally {
      setAskingAssistant(false);
    }
  };

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
      setSearchMode(false);
      setPage(1);
      fetchProjects();
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

  const runSuggestedSearch = (query) => {
    setSearchQuery(query);
    handleSearch({ preventDefault: () => {} }, query);
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
        setProjects(projects.filter(p => p.id !== projectId));
      } catch (err) {
        setError('Failed to delete project. Please try again.');
      }
    }
  };

  return (
    <div className="dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Projects</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {summary && (
          <section className="metrics-grid" aria-label="Productivity summary">
            <div className="metric"><strong>{summary.projects}</strong><span>Projects</span></div>
            <div className="metric"><strong>{summary.tasks}</strong><span>Total tasks</span></div>
            <div className="metric"><strong>{summary.completed_tasks}</strong><span>Completed</span></div>
            <div className={`metric ${summary.overdue_tasks ? 'metric-warning' : ''}`}><strong>{summary.overdue_tasks}</strong><span>Overdue</span></div>
          </section>
        )}

        <section className="assistant-section">
          <div>
            <p className="eyebrow">PROJECT ASSISTANT</p>
            <h2>What should you work on?</h2>
          </div>
          <form onSubmit={askAssistant} className="assistant-form">
            <input
              type="text"
              aria-label="Ask project assistant"
              placeholder="Ask about overdue tasks or your next task"
              value={assistantQuestion}
              onChange={(e) => setAssistantQuestion(e.target.value)}
              disabled={askingAssistant}
            />
            <button type="submit" disabled={askingAssistant}>{askingAssistant ? 'Thinking...' : 'Ask'}</button>
          </form>
          {assistantAnswer && <p className="assistant-answer">{assistantAnswer}</p>}
        </section>

        <section className="ai-search-section">
          <div>
            <p className="eyebrow">AI PROJECT FINDER</p>
            <h2>Find the right project</h2>
            <p>Search naturally across project descriptions and tasks.</p>
          </div>
          <form onSubmit={handleSearch} className="project-search-form">
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Try “website tasks” or “mobile app”"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={searching}
            />
            <button type="submit" disabled={searching}>
              {searching ? 'Searching...' : 'Find projects'}
            </button>
            {searchMode && (
              <button type="button" className="clear-search" onClick={clearSearch}>
                Clear
              </button>
            )}
          </form>
          <div className="search-suggestions">
            <span>Try:</span>
            {['website tasks', 'mobile app', 'completed'].map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => runSuggestedSearch(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </section>

        <div className="create-project-section">
          <h2>Create New Project</h2>
          <form onSubmit={handleCreateProject} className="create-project-form">
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              disabled={creatingProject}
            />
            <textarea
              placeholder="Project Description (optional)"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              disabled={creatingProject}
              rows="3"
            />
            <div className="form-row">
              <label>Priority<select value={newProjectPriority} onChange={(e) => setNewProjectPriority(e.target.value)} disabled={creatingProject}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select></label>
              <label>Due date<input type="date" value={newProjectDueDate} onChange={(e) => setNewProjectDueDate(e.target.value)} disabled={creatingProject} /></label>
            </div>
            <button type="submit" disabled={creatingProject}>
              {creatingProject ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {summary && (
          <section className="upcoming-section" aria-label="Upcoming deadlines">
            <div className="section-heading"><div><p className="eyebrow">UP NEXT</p><h2>Upcoming deadlines</h2></div><span>{summary.upcoming_tasks.length} open task{summary.upcoming_tasks.length === 1 ? '' : 's'}</span></div>
            {summary.upcoming_tasks.length === 0 ? <p className="empty-upcoming">No open deadlines on the horizon.</p> : (
              <div className="upcoming-list">{summary.upcoming_tasks.map((task) => <Link key={task.id} to={`/projects/${task.project_id}`} className="upcoming-item"><span>{task.title}</span><small>{task.project_name} · {new Date(task.due_date).toLocaleDateString()}</small></Link>)}</div>
            )}
          </section>
        )}

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="no-projects">
            <p>{searchMode ? 'No projects matched that search.' : 'No projects yet. Create one to get started!'}</p>
          </div>
        ) : (
          <>
            <div className="project-toolbar">
              <p>
                {searchMode ? `${visibleProjects.length} matching project${visibleProjects.length === 1 ? '' : 's'}` : `${visibleProjects.length} project${visibleProjects.length === 1 ? '' : 's'}`}
              </p>
              <div className="project-controls">
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
                    <option value="recent">Recently created</option>
                    <option value="name">Name</option>
                    <option value="tasks">Most tasks</option>
                  </select>
                </label>
              </div>
            </div>
            {visibleProjects.length === 0 ? (
              <div className="no-projects"><p>No projects match this filter.</p></div>
            ) : (
            <div className="projects-grid">
              {visibleProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
            )}

            {!searchMode && visibleProjects.length > 0 && <div className="pagination">
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
            </div>}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
