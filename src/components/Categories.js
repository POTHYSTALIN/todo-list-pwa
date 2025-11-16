import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Alert } from 'react-bootstrap';
import PageHeader from './PageHeader';
import { getAllCategories, addCategory, updateCategory, deleteCategory, getAllTodos, getSetting, syncCategoriesOnDB } from '../utils/db';
import { syncCategories } from '../utils/api';

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
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showSyncAlert, setShowSyncAlert] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  // Refresh category counts
  const refreshCounts = async () => {
    await loadCategories();
  };

  // Sync categories with Google Drive via backend API
  const handleSync = async () => {
    let mergedCategories = null;
    try {
      setSyncing(true);
      setShowSyncAlert(false);

      // Get current categories
      const currentCategories = await getAllCategories();

      // Sync with backend API
      mergedCategories = await syncCategories(currentCategories);

      // Import merged categories to IndexedDB
      await syncCategoriesOnDB(mergedCategories);

      // Refresh UI with synced data
      await loadCategories();

      setSyncMessage('Categories synced successfully!');
      setShowSyncAlert(true);
      setTimeout(() => setShowSyncAlert(false), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      // Show full error details in alert
      let errorDetails = '{}';
      if (mergedCategories && false) {
        errorDetails = JSON.stringify(mergedCategories);
      }
      setSyncMessage(`Sync failed: ${error.message}\n\nDetails:\n${errorDetails}`);
      setShowSyncAlert(true);
    } finally {
      setSyncing(false);
    }
  };
  
  const headerActions = [
    {
      variant: 'outline-secondary',
      onClick: refreshCounts,
      title: 'Refresh Counts',
      icon: 'bi-arrow-clockwise',
      label: 'Refresh'
    },
    {
      variant: 'success',
      onClick: handleSync,
      disabled: syncing || !isApiConnected,
      title: isApiConnected ? 'Sync with Google Drive' : 'API not connected. Go to Integrations to connect.',
      icon: syncing ? 'bi-arrow-repeat' : 'bi-cloud-arrow-up',
      label: syncing ? 'Syncing...' : 'Sync'
    },
    {
      variant: 'primary',
      onClick: () => setShowForm(!showForm),
      title: showForm ? 'Cancel' : 'Add Category',
      icon: showForm ? 'bi-x-lg' : 'bi-plus-lg',
      label: showForm ? 'Cancel' : 'Add Category'
    }
  ];

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

  // Load categories and API connection status on component mount
  useEffect(() => {
    const loadApiConnectionStatus = async () => {
      const apiConnected = await getSetting('apiConnected');
      setIsApiConnected(apiConnected === true);
    };
    
    loadCategories();
    loadApiConnectionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div>
      <PageHeader 
        page="categories"
        actions={headerActions}
      />
      
      {/* Sync Alert */}
      {showSyncAlert && (
        <Alert 
          variant={syncMessage.includes('failed') || syncMessage.includes('configure') ? 'danger' : 'success'} 
          dismissible 
          onClose={() => setShowSyncAlert(false)}
          className="mb-3"
        >
          {syncMessage}
        </Alert>
      )}
      
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