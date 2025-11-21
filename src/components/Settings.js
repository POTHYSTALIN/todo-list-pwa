import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import PageHeader from './PageHeader';
import { getSetting, saveSetting, deleteSetting, getDeviceId, getAllTodos, updateTodo, getAllCategories, updateCategory } from '../utils/db';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [originalDeviceId, setOriginalDeviceId] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');

  useEffect(() => {
    // Load saved API URL and Device ID from IndexedDB
    const loadSettings = async () => {
      const savedApiUrl = await getSetting('apiUrl');
      setApiUrl(savedApiUrl || process.env.REACT_APP_API_URL || '');
      
      const savedDeviceId = await getDeviceId();
      setDeviceId(savedDeviceId);
      setOriginalDeviceId(savedDeviceId);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await saveSetting('apiUrl', apiUrl);
      
      // Check if deviceId has changed
      if (deviceId !== originalDeviceId) {
        await updateDeviceId(deviceId);
      }
      
      setAlertMessage('Settings saved successfully!');
      setAlertVariant('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlertMessage('Error saving settings. Please try again.');
      setAlertVariant('danger');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const updateDeviceId = async (newDeviceId) => {
    try {
      // Save the new device ID
      await saveSetting('deviceId', newDeviceId);
      
      // Update all todos with the new device ID
      const todos = await getAllTodos();
      for (const todo of todos) {
        await updateTodo({
          ...todo,
          deviceId: newDeviceId
        });
      }
      
      // Update all categories with the new device ID
      const categories = await getAllCategories();
      for (const category of categories) {
        await updateCategory({
          ...category,
          deviceId: newDeviceId
        });
      }
      
      // Update the original device ID to the new one
      setOriginalDeviceId(newDeviceId);
      
      console.log(`Device ID updated to ${newDeviceId}. Updated ${todos.length} todos and ${categories.length} categories.`);
    } catch (error) {
      console.error('Error updating device ID:', error);
      throw error;
    }
  };

  const handleReset = async () => {
    const defaultUrl = process.env.REACT_APP_API_URL || '';
    setApiUrl(defaultUrl);
    await deleteSetting('apiUrl');
    setAlertMessage('Settings reset to default!');
    setAlertVariant('info');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="settings-page">
      <PageHeader page="settings" />
      
      {showAlert && (
        <Alert 
          variant={alertVariant} 
          dismissible 
          onClose={() => setShowAlert(false)}
          className="mb-3"
        >
          {alertMessage}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>
            <i className="bi bi-server me-2"></i>
            API Configuration
          </Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Backend API URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter backend API URL"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <Form.Text className="text-muted">
                The URL of your One Nest backend API (e.g., http://localhost:3001 or https://your-api.vercel.app)
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSave}
              >
                <i className="bi bi-save me-1"></i>
                Save Settings
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={handleReset}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset to Default
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>
            <i className="bi bi-phone me-2"></i>
            Device Information
          </Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Device ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
              <Form.Text className="text-muted">
                This unique identifier is used to track data from this device during synchronization. 
                Changing this will update all todos and categories with the new device ID.
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSave}
              >
                <i className="bi bi-save me-1"></i>
                Save Device ID
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>
            <i className="bi bi-info-circle me-2"></i>
            About
          </Card.Title>
          <p className="mb-2">
            <strong>App Name:</strong> One Nest
          </p>
          <p className="mb-2">
            <strong>Version:</strong> 1.0.0
          </p>
          <p className="mb-0 text-muted">
            Keep everything in One Nest
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Settings;

