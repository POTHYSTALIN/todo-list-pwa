import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getAllTodos, addTodo, updateTodo, deleteTodo, exportTodosAsCSV } from '../utils/db';

// Create the context
const TodoContext = createContext();

// Custom hook to use the context
export const useTodoContext = () => useContext(TodoContext);

// Provider component
export const TodoProvider = ({ children }) => {
  // State for todos
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(false); // Start with false until we confirm
  const [syncPending, setSyncPending] = useState(false);

  // More reliable network check
  const checkNetworkConnection = useCallback(async () => {
    try {
      // Try to fetch a small resource with a cache-busting parameter
      const response = await fetch('https://www.google.com/favicon.ico?_=' + new Date().getTime(), {
        // Using no-cors mode to avoid CORS issues
        mode: 'no-cors',
        // Short timeout to quickly determine connectivity
        signal: AbortSignal.timeout(3000)
      });
      
      console.log('Network connectivity test:', response.type);
      setNetworkStatus(true);
      
      // If we're back online and have pending syncs, we could trigger a sync here
      if (syncPending) {
        console.log('Back online! Syncing data...');
        setSyncPending(false);
      }
    } catch (err) {
      console.log('Network connectivity test failed:', err.message);
      setNetworkStatus(false);
    }
  }, [syncPending]);

  // Network status change handler
  const handleNetworkChange = useCallback(() => {
    if (navigator.onLine) {
      // Even if browser reports online, verify with an actual connection test
      checkNetworkConnection();
    } else {
      // If browser reports offline, we can be certain
      setNetworkStatus(false);
    }
  }, [checkNetworkConnection]);

  // Check connectivity periodically
  useEffect(() => {
    // Initial check
    checkNetworkConnection();
    
    // Set up periodic checks
    const intervalId = setInterval(() => {
      checkNetworkConnection();
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkNetworkConnection]);

  // Load todos on initial render
  useEffect(() => {
    loadTodos();
    
    // Set up event listeners for online/offline status
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [handleNetworkChange]);

  // Load all todos from IndexedDB
  const loadTodos = async () => {
    try {
      console.log('Starting to load todos from IndexedDB...');
      setLoading(true);
      const data = await getAllTodos();
      console.log('Loaded todos from IndexedDB:', data);
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Error loading todos:', err);
      setError('Failed to load todos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo
  const handleAddTodo = async (todo) => {
    try {
      setLoading(true);
      const id = await addTodo(todo);
      const newTodo = { ...todo, id, timestamp: new Date().getTime() };
      setTodos([...todos, newTodo]);
      
      // If offline, mark for sync when online
      if (!networkStatus) {
        setSyncPending(true);
      }
      
      return newTodo;
    } catch (err) {
      console.error('Error adding todo:', err);
      setError('Failed to add todo. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing todo
  const handleUpdateTodo = async (todo) => {
    try {
      setLoading(true);
      await updateTodo(todo);
      setTodos(todos.map(t => t.id === todo.id ? todo : t));
      
      // If offline, mark for sync when online
      if (!networkStatus) {
        setSyncPending(true);
      }
      
      return todo;
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Failed to update todo. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a todo
  const handleDeleteTodo = async (id) => {
    try {
      setLoading(true);
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      
      // If offline, mark for sync when online
      if (!networkStatus) {
        setSyncPending(true);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Failed to delete todo. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle todo completion status
  const handleToggleTodo = async (id) => {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
      const updatedTodo = { ...todo, completed: !todo.completed };
      return handleUpdateTodo(updatedTodo);
    }
    return null;
  };

  // Export todos to CSV
  const handleExportToCsv = async () => {
    try {
      await exportTodosAsCSV();
      return true;
    } catch (err) {
      console.error('Error exporting todos:', err);
      setError('Failed to export todos. Please try again.');
      return false;
    }
  };

  // Force a network status check
  const checkConnection = () => {
    checkNetworkConnection();
  };

  // Context value
  const value = {
    todos,
    loading,
    error,
    networkStatus,
    syncPending,
    addTodo: handleAddTodo,
    updateTodo: handleUpdateTodo,
    deleteTodo: handleDeleteTodo,
    toggleTodo: handleToggleTodo,
    exportToCsv: handleExportToCsv,
    refreshTodos: loadTodos,
    checkConnection,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}; 