import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { getAllTodos, getAllCategories, getAllIntegrations } from '../utils/db';

const Export = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExportData = async () => {
    try {
      // Fetch all data from IndexedDB
      const todos = await getAllTodos();
      const categories = await getAllCategories();
      const integrations = await getAllIntegrations();

      // Combine all data into one object
      const exportData = {
        todos,
        categories,
        integrations,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create a Blob with the JSON content
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `todo-app-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      console.log('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div className="export-page">
      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <i className="bi bi-check-circle me-2"></i>
          Data exported successfully!
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <i className="bi bi-download me-2"></i>
            Export All Data
          </h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            Export all your todos, categories, and integrations as a JSON file. 
            You can use this file as a backup or to transfer your data.
          </p>
          <Button 
            variant="primary" 
            onClick={handleExportData}
          >
            <i className="bi bi-download me-2"></i>
            Export Data as JSON
          </Button>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h6 className="mb-0 text-muted">
            <i className="bi bi-info-circle me-2"></i>
            What's included?
          </h6>
        </Card.Header>
        <Card.Body>
          <ul className="mb-0">
            <li>All todos with their details (title, description, priority, category, status)</li>
            <li>All categories</li>
            <li>All integration settings</li>
            <li>Export date and version information</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Export;

