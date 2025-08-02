import React, { useState, useEffect } from 'react';
import { ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { useTodoContext } from '../contexts/TodoContext';
import { getAllCategories } from '../utils/db';

const TodoItem = ({ todo }) => {
  const { toggleTodo, deleteTodo, updateTodo } = useTodoContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');
  const [editedPriority, setEditedPriority] = useState(todo.priority || 'Medium');
  const [editedCategory, setEditedCategory] = useState(todo.category || '');
  const [categories, setCategories] = useState([]);

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesFromDB = await getAllCategories();
        setCategories(categoriesFromDB);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

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
        description: editedDescription.trim(),
        priority: editedPriority,
        category: editedCategory || null
      });
      setIsEditing(false);
    }
  };

  // Handle canceling edit mode
  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDescription(todo.description || '');
    setEditedPriority(todo.priority || 'Medium');
    setEditedCategory(todo.category || '');
    setIsEditing(false);
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get priority badge variant
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'Highest':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'primary';
      case 'Low':
        return 'info';
      case 'Very Low':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : null;
  };

  // Get category color by ID
  const getCategoryColor = (categoryId) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : null;
  };

  return (
    <ListGroup.Item 
      className={`todo-item text-start ${todo.completed ? 'bg-light' : ''}`}
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
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value)}
                >
                  <option value="Highest">Highest</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Very Low">Very Low</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
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
                <div className="d-flex align-items-center mb-1">
                  <h5 className={todo.completed ? 'text-decoration-line-through text-muted mb-0 me-2' : 'mb-0 me-2'}>
                    {todo.title}
                  </h5>
                  <Badge bg={getPriorityVariant(todo.priority || 'Medium')} className="fs-6 me-2">
                    {todo.priority || 'Medium'}
                  </Badge>
                  {todo.category && getCategoryName(todo.category) && (
                    <Badge bg={getCategoryColor(todo.category)} className="fs-6">
                      <i className="bi bi-tag me-1"></i>
                      {getCategoryName(todo.category)}
                    </Badge>
                  )}
                </div>
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