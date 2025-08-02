import React, { useState } from 'react';
import { ListGroup, Form, Button } from 'react-bootstrap';
import { useTodoContext } from '../contexts/TodoContext';

const TodoItem = ({ todo }) => {
  const { toggleTodo, deleteTodo, updateTodo } = useTodoContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');

  // Handle toggling todo completion
  const handleToggle = () => {
    toggleTodo(todo.id);
  };

  // Handle deleting todo
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteTodo(todo.id);
    }
  };

  // Handle saving edited todo
  const handleSave = () => {
    if (editedTitle.trim()) {
      updateTodo({
        ...todo,
        title: editedTitle.trim(),
        description: editedDescription.trim()
      });
      setIsEditing(false);
    }
  };

  // Handle canceling edit mode
  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setIsEditing(false);
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ListGroup.Item 
      className={`todo-item ${todo.completed ? 'bg-light' : ''}`}
    >
      {isEditing ? (
        // Edit mode
        <div className="w-100">
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleCancel}
              className="btn-icon-text"
              title="Cancel"
            >
              <i className="bi bi-x-lg"></i>
              <span className="btn-text">Cancel</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSave}
              className="btn-icon-text"
              title="Save"
            >
              <i className="bi bi-check-lg"></i>
              <span className="btn-text">Save</span>
            </Button>
          </div>
        </div>
      ) : (
        // View mode
        <div className="todo-item-container">
          <div className="todo-content">
            <div className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggle}
                label=""
                className="me-2"
              />
              <div>
                <h5 className={todo.completed ? 'text-decoration-line-through text-muted mb-1' : 'mb-1'}>
                  {todo.title}
                </h5>
                {todo.description && (
                  <p className="text-muted mb-1">{todo.description}</p>
                )}
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {formatDate(todo.timestamp)}
                </small>
              </div>
            </div>
          </div>
          <div className="todo-actions">
            <Button
              variant="outline-primary"
              onClick={() => setIsEditing(true)}
              className="action-btn"
              title="Edit"
            >
              <i className="bi bi-pencil"></i>
              <span className="btn-text">Edit</span>
            </Button>
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              className="action-btn"
              title="Delete"
            >
              <i className="bi bi-trash"></i>
              <span className="btn-text">Delete</span>
            </Button>
          </div>
        </div>
      )}
    </ListGroup.Item>
  );
};

export default TodoItem; 