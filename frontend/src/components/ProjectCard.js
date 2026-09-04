import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProjectCard.css';

function ProjectCard({ project, onDelete }) {
  return (
    <div className="project-card">
      <div className="card-header">
        <h3>{project.name}</h3>
        <span className="task-count">{project.task_count} tasks</span>
      </div>
      <p className="card-description">{project.description}</p>
      <p className="project-meta"><span className={`priority priority-${project.priority || 'medium'}`}>{project.priority || 'medium'} priority</span>{project.due_date && ` Due ${new Date(project.due_date).toLocaleDateString()}`}</p>
      <div className="progress-row"><span>Progress</span><strong>{project.progress || 0}%</strong></div>
      <div className="progress-track"><span style={{ width: `${project.progress || 0}%` }} /></div>
      {project.match_reason && (
        <p className="match-reason">AI match: {project.match_reason}</p>
      )}
      <div className="card-footer">
        <Link to={`/projects/${project.id}`} className="view-btn">
          View Project
        </Link>
        <button 
          onClick={() => onDelete(project.id)}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
