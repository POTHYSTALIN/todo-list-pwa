import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import PageHeader from './PageHeader';
import { getSetting, saveSetting, deleteSetting } from '../utils/db';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('success');

  useEffect(() => {
    // Load saved API URL from IndexedDB
    const loadSettings = async () => {
      const savedApiUrl = await getSetting('apiUrl');
      setApiUrl(savedApiUrl || process.env.REACT_APP_API_URL || '');
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    await saveSetting('apiUrl', apiUrl);
    setAlertMessage('Settings saved successfully!');
    setAlertVariant('success');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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

