import React, { useState } from 'react';
import '../styles/TaskItem.css';

function TaskItem({ task, onDelete, onUpdate, draggable, onDragStart, onDragOver, onDrop }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editStatus, setEditStatus] = useState(task.status);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : '');

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
      description: editDesc,
      status: editStatus,
      due_date: editDueDate || null,
      priority: editPriority
    });
    setIsEditing(false);
  };

  const getStatusClass = (status) => {
    return `status-${status.replace('_', '-')}`;
  };

  return (
    <div className="task-item" draggable={draggable} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}>
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Task description"
            rows="2"
          />
          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="form-row"><label>Priority<select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Due date<input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} /></label></div>
          <div className="edit-buttons">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-content">
            <div className="task-header">
              <h4>{task.title}</h4>
              <span className={`status ${getStatusClass(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}
            {task.due_date && (
              <p className="task-due-date">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            <span className={`priority priority-${task.priority || 'medium'}`}>{task.priority || 'medium'} priority</span>
          </div>
          <div className="task-actions">
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(task.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskItem;
