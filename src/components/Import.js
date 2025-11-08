import React, { useState, useRef } from 'react';
import { Card, Button, Alert, Form } from 'react-bootstrap';
import { initDB } from '../utils/db';

const Import = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const clearAllData = async (db) => {
    // Clear todos
    const todosTx = db.transaction('todos', 'readwrite');
    const todosStore = todosTx.objectStore('todos');
    await todosStore.clear();
    await todosTx.done;

    // Clear categories
    const categoriesTx = db.transaction('categories', 'readwrite');
    const categoriesStore = categoriesTx.objectStore('categories');
    await categoriesStore.clear();
    await categoriesTx.done;

    // Clear integrations
    const integrationsTx = db.transaction('integrations', 'readwrite');
    const integrationsStore = integrationsTx.objectStore('integrations');
    await integrationsStore.clear();
    await integrationsTx.done;

    console.log('All data cleared');
  };

  const importDataToDB = async (data) => {
    const db = await initDB();

    // Import todos
    if (data.todos && Array.isArray(data.todos)) {
      const todosTx = db.transaction('todos', 'readwrite');
      const todosStore = todosTx.objectStore('todos');
      for (const todo of data.todos) {
        await todosStore.put(todo);
      }
      await todosTx.done;
      console.log(`Imported ${data.todos.length} todos`);
    }

    // Import categories
    if (data.categories && Array.isArray(data.categories)) {
      const categoriesTx = db.transaction('categories', 'readwrite');
      const categoriesStore = categoriesTx.objectStore('categories');
      for (const category of data.categories) {
        await categoriesStore.put(category);
      }
      await categoriesTx.done;
      console.log(`Imported ${data.categories.length} categories`);
    }

    // Import integrations
    if (data.integrations && Array.isArray(data.integrations)) {
      const integrationsTx = db.transaction('integrations', 'readwrite');
      const integrationsStore = integrationsTx.objectStore('integrations');
      for (const integration of data.integrations) {
        await integrationsStore.put(integration);
      }
      await integrationsTx.done;
      console.log(`Imported ${data.integrations.length} integrations`);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileContent = event.target.result;
          const parsedData = JSON.parse(fileContent);

          // Validate the imported data structure
          if (!parsedData.todos && !parsedData.categories && !parsedData.integrations) {
            throw new Error('Invalid import file format');
          }

          // Clear all existing data
          const db = await initDB();
          await clearAllData(db);

          // Import new data
          await importDataToDB(parsedData);

          setShowSuccess(true);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }

          setTimeout(() => {
            setShowSuccess(false);
            // Reload the page to refresh all data
            window.location.reload();
          }, 2000);

          console.log('Data imported successfully');
        } catch (error) {
          console.error('Error parsing or importing data:', error);
          setErrorMessage(error.message || 'Failed to import data');
          setShowError(true);
          setTimeout(() => setShowError(false), 5000);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read file');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      };

      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error importing data:', error);
      setErrorMessage(error.message || 'Failed to import data');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <div className="import-page">
      {showSuccess && (
        <Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>
          <i className="bi bi-check-circle me-2"></i>
          Data imported successfully! Reloading...
        </Alert>
      )}

      {showError && (
        <Alert variant="danger" dismissible onClose={() => setShowError(false)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error: {errorMessage}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <i className="bi bi-upload me-2"></i>
            Import Data
          </h5>
        </Card.Header>
        <Card.Body>
          <p className="text-muted mb-3">
            Import data from a previously exported JSON file. This will overwrite all current data.
          </p>
          
          <div className="d-flex align-items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              style={{ display: 'none' }}
              id="import-file"
            />
            <label htmlFor="import-file" className="btn btn-outline-secondary mb-0">
              <i className="bi bi-file-earmark me-1"></i>
              Choose File
            </label>
            {selectedFile && (
              <small className="text-muted">{selectedFile.name}</small>
            )}
            <Button 
              variant="primary" 
              onClick={handleImport}
              disabled={!selectedFile}
            >
              <i className="bi bi-upload me-2"></i>
              Import Data
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4 border-warning">
        <Card.Header className="bg-warning bg-opacity-10">
          <h6 className="mb-0 text-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Warning
          </h6>
        </Card.Header>
        <Card.Body>
          <p className="mb-0 text-muted">
            Importing data will <strong>permanently delete</strong> all your current todos, categories, and integration settings. 
            Make sure to export your current data before importing if you want to keep a backup.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Import;

