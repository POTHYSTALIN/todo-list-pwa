import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { getAllCategories, addCategory, updateCategory, deleteCategory, getAllTodos } from '../utils/db';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'primary'
  });

  const colorOptions = [
    { value: 'primary', label: 'Blue', class: 'bg-primary' },
    { value: 'success', label: 'Green', class: 'bg-success' },
    { value: 'warning', label: 'Yellow', class: 'bg-warning' },
    { value: 'info', label: 'Cyan', class: 'bg-info' },
    { value: 'danger', label: 'Red', class: 'bg-danger' },
    { value: 'secondary', label: 'Gray', class: 'bg-secondary' }
  ];

  // Calculate category counts from todos
  const calculateCategoryCounts = (categories, todos) => {
    const categoryCounts = {};
    
    // Initialize counts for all categories
    categories.forEach(category => {
      categoryCounts[category.id] = 0;
    });
    
    // Count todos for each category
    todos.forEach(todo => {
      if (todo.category && categoryCounts.hasOwnProperty(todo.category)) {
        categoryCounts[todo.category]++;
      }
    });
    
    // Update categories with real counts
    return categories.map(category => ({
      ...category,
      count: categoryCounts[category.id] || 0
    }));
  };

  // Load categories and calculate counts
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const categoriesFromDB = await getAllCategories();
      const todosFromDB = await getAllTodos();
      
      // Calculate real counts for each category
      const categoriesWithCounts = calculateCategoryCounts(categoriesFromDB, todosFromDB);
      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Edit existing category
        const updatedCategory = { ...editingCategory, ...formData };
        await updateCategory(updatedCategory);
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? updatedCategory : cat
        ));
        setEditingCategory(null);
      } else {
        // Add new category
        const newCategory = {
          ...formData,
          count: 0
        };
        const id = await addCategory(newCategory);
        const categoryWithId = { ...newCategory, id };
        setCategories([...categories, categoryWithId]);
      }
      setShowForm(false);
      setFormData({ name: '', description: '', color: 'primary' });
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId);
        setCategories(categories.filter(cat => cat.id !== categoryId));
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: 'primary' });
    setError('');
  };

  // Refresh category counts
  const refreshCounts = async () => {
    await loadCategories();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="bi bi-collection me-2"></i>
            Categories
          </h2>
          <p className="text-muted mb-0">Organize your todos into different categories</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={refreshCounts}
            className="btn-icon-text"
            title="Refresh Counts"
          >
            <i className="bi bi-arrow-clockwise"></i>
            <span className="btn-text">Refresh</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowForm(true)}
            className="btn-icon-text"
            title="Add Category"
          >
            <i className="bi bi-plus-lg"></i>
            <span className="btn-text">Add Category</span>
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Category Form */}
      {showForm && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>
              <i className="bi bi-plus-circle me-2"></i>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </Card.Title>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter category name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Color</Form.Label>
                    <Form.Select
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    >
                      {colorOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter category description"
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  <i className="bi bi-check-lg me-2"></i>
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={handleCancel}>
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {/* Categories Grid */}
      {!loading && (
        <Row>
          {categories.map((category) => (
            <Col key={category.id} xs={12} sm={6} lg={6} className="mb-3">
              <Card className={`border-${category.color} h-100`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <Card.Title className={`text-${category.color} mb-2`}>
                        <i className="bi bi-tag me-2"></i>
                        {category.name}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        {category.description}
                      </Card.Text>
                      <span className={`badge bg-${category.color} rounded-pill`}>
                        {category.count} {category.count === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        title="Edit Category"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        title="Delete Category"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {!loading && categories.length === 0 && (
        <div className="text-center py-4">
          <i className="bi bi-collection display-1 text-muted"></i>
          <p className="text-muted mt-3">No categories found.</p>
          <p className="text-muted">Click the "Add Category" button to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Categories; 