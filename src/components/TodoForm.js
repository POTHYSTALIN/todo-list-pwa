import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useTodoContext } from '../contexts/TodoContext';
import { getAllCategories } from '../utils/db';

const TodoForm = ({ onComplete }) => {
  const { addTodo } = useTodoContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [validated, setValidated] = useState(false);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const form = event.currentTarget;
    if (!form.checkValidity() || !title.trim()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    const newTodo = {
      title: title.trim(),
      description: description.trim(),
      priority: priority,
      category: category || null, // Use null if no category selected
      completed: false,
    };

    const result = await addTodo(newTodo);
    
    if (result) {
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('');
      setValidated(false);
      
      // Call onComplete callback if provided
      if (onComplete) onComplete();
    }
  };

  return (
    <Card className="mb-4">
      <Card.Body className="text-start">
        <Card.Title>
          <i className="bi bi-plus-circle me-2"></i>
          Add New Todo
        </Card.Title>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="todoTitle">
            <Form.Label>
              <i className="bi bi-card-heading me-1"></i>
              Title
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter todo title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
            <Form.Control.Feedback type="invalid">
              <i className="bi bi-exclamation-circle me-1"></i>
              Please provide a title.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="todoDescription">
            <Form.Label>
              <i className="bi bi-card-text me-1"></i>
              Description (optional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="todoPriority">
                <Form.Label>
                  <i className="bi bi-flag me-1"></i>
                  Priority
                </Form.Label>
                <Form.Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
              <Form.Group className="mb-3 dummy" controlId="todoCategory">
                <Form.Label>
                  <i className="bi bi-tag me-1"></i>
                  Category (optional)
                </Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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

          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              className="me-2 btn-icon-text" 
              onClick={onComplete}
              title="Cancel"
            >
              <i className="bi bi-x-circle"></i>
              <span className="btn-text">Cancel</span>
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              className="btn-icon-text"
              title="Add Todo"
            >
              <i className="bi bi-save"></i>
              <span className="btn-text">Add Todo</span>
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TodoForm; 