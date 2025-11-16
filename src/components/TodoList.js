import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Badge, Form, Alert } from 'react-bootstrap';
import { useTodoContext } from '../contexts/TodoContext';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';
import PageHeader from './PageHeader';
import { getAllTodos, getAllCategories, getSetting, syncTodosOnDB } from '../utils/db';
import { syncTodos } from '../utils/api';

const TodoList = () => {
  const { 
    todos, 
    loading, 
    error, 
    networkStatus, 
    syncPending,
    exportToCsv,
    refreshTodos,
    checkConnection
  } = useTodoContext();
  
  const [filter, setFilter] = useState('active'); // 'all', 'active', 'completed'
  const [categoryFilter, setCategoryFilter] = useState(''); // category ID or empty for all
  const [sortBy, setSortBy] = useState('priority'); // 'timestamp', 'priority', 'title'
  const [showForm, setShowForm] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [categories, setCategories] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [showSyncAlert, setShowSyncAlert] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  
  // Function to check IndexedDB directly
  const checkIndexedDB = async () => {
    try {
      const todosFromDB = await getAllTodos();
      setDebugInfo(`Found ${todosFromDB.length} todos in IndexedDB: ${JSON.stringify(todosFromDB)}`);
      console.log('Todos from IndexedDB:', todosFromDB);
      
      // Refresh todos from IndexedDB
      refreshTodos();
    } catch (error) {
      setDebugInfo(`Error: ${error.message}`);
      console.error('Error checking IndexedDB:', error);
    }
  };

  // Sync todos with Google Drive via backend API
  const handleSync = async () => {
    try {
      setSyncing(true);
      setShowSyncAlert(false);

      // Get current todos
      const currentTodos = await getAllTodos();
      
      // Sync with backend API
      const mergedTodos = await syncTodos(currentTodos);
      
      // Import merged todos to IndexedDB
      await syncTodosOnDB(mergedTodos);
      
      // Refresh UI with synced data
      refreshTodos();
      
      setSyncMessage('Todos synced successfully!');
      setShowSyncAlert(true);
      setTimeout(() => setShowSyncAlert(false), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncMessage(`Sync failed: ${error.message}`);
      setShowSyncAlert(true);
    } finally {
      setSyncing(false);
    }
  };
  
  const statusBadges = (
    <>
      {networkStatus ? (
        <Badge bg="success">
          <i className="bi bi-wifi me-1"></i> <span className="badge-text">Online</span>
        </Badge>
      ) : (
        <Badge bg="warning text-dark">
          <i className="bi bi-wifi-off me-1"></i> <span className="badge-text">Offline</span>
        </Badge>
      )}
      {syncPending && (
        <Badge bg="info" className="ms-2">
          <i className="bi bi-arrow-repeat me-1"></i> <span className="badge-text">Sync Pending</span>
        </Badge>
      )}
    </>
  );

  const headerActions = [
    {
      variant: 'primary',
      onClick: () => setShowForm(!showForm),
      title: showForm ? 'Cancel' : 'Add Todo',
      icon: showForm ? 'bi-x-lg' : 'bi-plus-lg',
      label: showForm ? 'Cancel' : 'Add Todo'
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
      variant: 'outline-secondary',
      onClick: exportToCsv,
      disabled: todos.length === 0,
      title: 'Export as CSV',
      icon: 'bi-download',
      label: 'Export CSV'
    },
    ...(process.env.NODE_ENV === 'development' ? [{
      variant: 'outline-info',
      onClick: checkIndexedDB,
      title: 'Debug IndexedDB',
      icon: 'bi-bug',
      label: 'Debug'
    }] : [])
  ];
  
  // Load categories and API connection status when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesFromDB = await getAllCategories();
        setCategories(categoriesFromDB);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    const loadApiConnectionStatus = async () => {
      const apiConnected = await getSetting('apiConnected');
      setIsApiConnected(apiConnected === true);
    };
    
    loadCategories();
    loadApiConnectionStatus();
  }, []);
  
  // Filter todos based on current filter and category
  const filteredTodos = todos.filter(todo => {
    // First filter by completion status
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    
    // Then filter by category
    if (categoryFilter && todo.category !== categoryFilter) return false;
    
    return true;
  });
  
  // Sort todos based on current sort option
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'Highest': 5, 'High': 4, 'Medium': 3, 'Low': 2, 'Very Low': 1 };
        const aPriority = priorityOrder[a.priority || 'Medium'];
        const bPriority = priorityOrder[b.priority || 'Medium'];
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Highest priority first
        }
        // If same priority, sort by timestamp (newest first)
        return b.timestamp - a.timestamp;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'timestamp':
      default:
        return b.timestamp - a.timestamp; // Newest first
    }
  });

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : null;
  };

  return (
    <div className="todo-list">
      <PageHeader 
        page="todos"
        statusBadges={statusBadges}
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
      
      {/* Debug Information */}
      {debugInfo && (
        <div className="alert alert-info mb-3" style={{ wordBreak: 'break-all' }}>
          <small>{debugInfo}</small>
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setDebugInfo('')}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Todo Form */}
      {showForm && (
        <div className="mb-4">
          <TodoForm onComplete={() => setShowForm(false)} />
        </div>
      )}
      
      {/* Filter and Sort controls */}
      <div className="mb-3">
        <div className="d-flex gap-2 align-items-center mb-2">
          <div className="d-flex gap-2">
            <Button 
              variant={filter === 'active' ? 'primary' : 'outline-primary'} 
              onClick={() => setFilter('active')}
              className="btn-icon-text"
            >
              <i className="bi bi-circle"></i>
              <span className="btn-text">Active</span>
            </Button>
            <Button 
              variant={filter === 'completed' ? 'primary' : 'outline-primary'} 
              onClick={() => setFilter('completed')}
              className="btn-icon-text"
            >
              <i className="bi bi-check-circle"></i>
              <span className="btn-text">Completed</span>
            </Button>
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline-primary'} 
              onClick={() => setFilter('all')}
              className="btn-icon-text"
            >
              <i className="bi bi-collection"></i>
              <span className="btn-text">All</span>
            </Button>
          </div>
          
          <div className="ms-auto">
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="sm"
              style={{ width: 'auto' }}
            >
              <option value="timestamp">Sort by Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
            </Form.Select>
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="d-flex gap-2 align-items-center">
          <div className="d-flex align-items-center">
            <i className="bi bi-tag me-2 text-muted"></i>
            <span className="text-muted me-2">Category:</span>
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="sm"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
            {categoryFilter && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setCategoryFilter('')}
                className="ms-2 btn-icon-text"
                title="Clear Category Filter"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </div>
          
          {/* Active filters display */}
          {(filter !== 'all' || categoryFilter) && (
            <div className="ms-auto">
              <small className="text-muted">
                Showing: 
                {filter !== 'all' && (
                  <Badge bg="info" className="ms-1">
                    {filter === 'active' ? 'Active' : 'Completed'}
                  </Badge>
                )}
                {categoryFilter && (
                  <Badge bg="secondary" className="ms-1">
                    {getCategoryName(categoryFilter)}
                  </Badge>
                )}
              </small>
            </div>
          )}
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
      
      {/* Todo items */}
      <ListGroup>
        {sortedTodos.length > 0 ? (
          sortedTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        ) : (
          <div className="text-center py-4">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <p className="text-muted mt-3">No todos found.</p>
            <p className="text-muted">
              {(filter !== 'all' || categoryFilter) 
                ? `Try adjusting your filters or add a new todo.` 
                : `Click the "Add Todo" button to get started.`}
            </p>
          </div>
        )}
      </ListGroup>
    </div>
  );
};

export default TodoList; 