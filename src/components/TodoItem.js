import React, { useState, useEffect } from 'react';
import { ListGroup, Form, Button, Badge, Dropdown, Modal } from 'react-bootstrap';
import { useTodoContext } from '../contexts/TodoContext';
import { getAllCategories } from '../utils/db';
import MarkdownEditor from './MarkdownEditor';
import MarkdownViewer from './MarkdownViewer';

const TodoItem = ({ todo }) => {
  const { toggleTodo, deleteTodo, updateTodo } = useTodoContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDescription, setEditedDescription] = useState(todo.description || '');
  const [editedPriority, setEditedPriority] = useState(todo.priority || 'Medium');
  const [editedCategory, setEditedCategory] = useState(todo.category || '');
  const [categories, setCategories] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

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
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p' : 'a';
    const formattedHours = hours % 12 || 12;
    
    return `${day}/${month}, ${formattedHours}:${minutes}${ampm}`;
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

  // Truncate text to specified length
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    // Remove markdown formatting for display
    const plainText = text.replace(/[#*_~`\[\]]/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  return (
    <ListGroup.Item 
      className={`todo-item text-start ${todo.completed ? 'bg-light' : ''}`}
    >
      {/* Always show view mode in list */}
      {(
        // View mode
        <div className="todo-item-view">
          <div className="d-flex align-items-start w-100">
            <Form.Check
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggle}
              label=""
              className="me-3 mt-1"
            />
            <div className="flex-grow-1">
              {/* Row 1: Priority, Title, Category, Date, and Menu */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center flex-wrap gap-2 flex-grow-1">
                  <span 
                    className="priority-indicator" 
                    style={{ backgroundColor: `var(--bs-${getPriorityVariant(todo.priority || 'Medium')})` }}
                    title={todo.priority || 'Medium'}
                  ></span>
                  <h6 className={`mb-0 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                    {todo.title}
                  </h6>
                  {todo.category && getCategoryName(todo.category) && (
                    <Badge bg={getCategoryColor(todo.category)} className="badge-sm">
                      <i className="bi bi-tag me-1"></i>
                      {getCategoryName(todo.category)}
                    </Badge>
                  )}
                  <small className="text-muted ms-auto">
                    <i className="bi bi-clock me-1"></i>
                    {formatDate(todo.timestamp)}
                  </small>
                </div>
                <Dropdown align="end" show={showMenu} onToggle={setShowMenu} className="ms-2">
                  <Dropdown.Toggle 
                    variant="link" 
                    className="todo-menu-btn p-0 border-0 text-muted"
                    id={`dropdown-${todo.id}`}
                  >
                    <i className="bi bi-three-dots-vertical fs-5"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setIsViewing(true)}>
                      <i className="bi bi-eye me-2"></i>
                      View
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setIsEditing(true)}>
                      <i className="bi bi-pencil me-2"></i>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => toggleTodo(todo.id)}>
                      <i className={`bi ${todo.completed ? 'bi-arrow-counterclockwise' : 'bi-check-circle'} me-2`}></i>
                      {todo.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleDelete} className="text-danger">
                      <i className="bi bi-trash me-2"></i>
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              
              {/* Row 2: Description */}
              {todo.description && (
                <p className="text-muted mb-0 small">
                  {truncateText(todo.description, 100)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Modal show={isViewing} onHide={() => setIsViewing(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-card-text me-2"></i>
            Todo Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h4 className={todo.completed ? 'text-decoration-line-through text-muted' : ''}>
              {todo.title}
            </h4>
          </div>
          
          <div className="mb-3">
            <strong className="d-block mb-2">Status:</strong>
            <Badge bg={todo.completed ? 'success' : 'secondary'} className="fs-6">
              <i className={`bi ${todo.completed ? 'bi-check-circle' : 'bi-circle'} me-1`}></i>
              {todo.completed ? 'Completed' : 'Pending'}
            </Badge>
          </div>

          <div className="mb-3">
            <strong className="d-block mb-2">Priority:</strong>
            <Badge bg={getPriorityVariant(todo.priority || 'Medium')} className="fs-6">
              <i className="bi bi-flag me-1"></i>
              {todo.priority || 'Medium'}
            </Badge>
          </div>

          {todo.category && getCategoryName(todo.category) && (
            <div className="mb-3">
              <strong className="d-block mb-2">Category:</strong>
              <Badge bg={getCategoryColor(todo.category)} className="fs-6">
                <i className="bi bi-tag me-1"></i>
                {getCategoryName(todo.category)}
              </Badge>
            </div>
          )}

          {todo.description && (
            <div className="mb-3">
              <strong className="d-block mb-2">Description:</strong>
              <div className="border rounded p-3 bg-light">
                <MarkdownViewer content={todo.description} />
              </div>
            </div>
          )}

          <div className="mb-0">
            <strong className="d-block mb-2">Created:</strong>
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {formatDate(todo.timestamp)}
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsViewing(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setIsViewing(false);
            setIsEditing(true);
          }}>
            <i className="bi bi-pencil me-1"></i>
            Edit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={isEditing} onHide={handleCancel} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil me-2"></i>
            Edit Todo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
            <MarkdownEditor
              value={editedDescription}
              onChange={setEditedDescription}
              height="250px"
              placeholder="Enter description (supports Markdown)"
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
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCancel}
            title="Cancel"
          >
            <i className="bi bi-x-lg me-1"></i>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            title="Save"
          >
            <i className="bi bi-check-lg me-1"></i>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </ListGroup.Item>
  );
};

export default TodoItem; 