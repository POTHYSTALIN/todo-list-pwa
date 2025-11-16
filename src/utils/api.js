/**
 * API utility for communicating with the Node.js backend
 */

import { getSetting } from './db';

/**
 * Sync todos with Google Drive via backend API
 * @param {Array} todos - Array of todo items
 * @returns {Promise<Array>} Merged todos from backend
 */
export async function syncTodos(todos) {
  try {
    const apiUrl = await getSetting('apiUrl');
    if (!apiUrl) {
      throw new Error('API not configured');
    }

    const response = await fetch(`${apiUrl}/api/sync/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todos }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to sync todos';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Sync todos API error:', error);
    throw error;
  }
}

/**
 * Sync categories with Google Drive via backend API
 * @param {Array} categories - Array of category items
 * @returns {Promise<Array>} Merged categories from backend
 */
export async function syncCategories(categories) {
  try {
    const apiUrl = await getSetting('apiUrl');
    if (!apiUrl) {
      throw new Error('API not configured');
    }

    const response = await fetch(`${apiUrl}/api/sync/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Failed to sync categories';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Sync categories API error:', error);
    throw error;
  }
}

/**
 * Check backend connection status
 * @returns {Promise<Object>} Connection status
 */
export async function checkBackendStatus() {
  try {
    const apiUrl = await getSetting('apiUrl');
    if (!apiUrl) {
      throw new Error('API not configured');
    }

    const response = await fetch(`${apiUrl}/api/sync/status`);
    
    if (!response.ok) {
      throw new Error('Backend not reachable');
    }

    return await response.json();
  } catch (error) {
    console.error('Backend status check error:', error);
    return { connected: false, message: error.message };
  }
}

/**
 * Health check for backend
 * @returns {Promise<Object>} Health status
 */
export async function checkBackendHealth() {
  try {
    const apiUrl = await getSetting('apiUrl');
    if (!apiUrl) {
      throw new Error('API not configured');
    }

    const response = await fetch(`${apiUrl}/health`);
    
    if (!response.ok) {
      throw new Error('Backend health check failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Backend health check error:', error);
    return { status: 'error', message: error.message };
  }
}

