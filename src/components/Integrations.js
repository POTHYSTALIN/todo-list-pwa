import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Modal, Table, Alert } from 'react-bootstrap';
import PageHeader from './PageHeader';
import { saveIntegration, getIntegration, deleteIntegration, getSetting, saveSetting } from '../utils/db';

const Integrations = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [credentialContent, setCredentialContent] = useState('');
  const [sharedFolderId, setSharedFolderId] = useState('');
  const [jsonFileId, setJsonFileId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load saved connection status and config on mount
    const loadSavedData = async () => {
      const apiConnected = await getSetting('apiConnected');
      setIsConnected(apiConnected === true);
      
      const googleData = await getIntegration('google');
      if (googleData) {
        setCredentialContent(googleData.credentials || '');
        setSharedFolderId(googleData.sharedFolderId || '');
        setJsonFileId(googleData.jsonFileId || '');
        console.log('Loaded Google integration data from IndexedDB');
      }
    };
    loadSavedData();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setShowError(false);
      setErrorMessage('');

      // Get API URL from settings
      const apiUrl = await getSetting('apiUrl');
      
      if (!apiUrl) {
        setErrorMessage('API not configured yet');
        setShowError(true);
        setIsConnected(false);
        return;
      }

      // Try to connect to API health endpoint
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      // Accept 200 (OK) and 304 (Not Modified) as successful responses
      if (!response.ok && response.status !== 304) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      // For 304, we consider it connected (cached response is fine)
      if (response.status === 304) {
        setIsConnected(true);
        setShowError(false);
        console.log('Connected to API (cached):', apiUrl);
        return;
      }

      // Parse response and validate
      const data = await response.json();
      
      // Check if response has correct structure
      if (data.status === 'ok' && data.message === 'One Nest API is running') {
        setIsConnected(true);
        setShowError(false);
        // Save connection status to settings
        await saveSetting('apiConnected', true);
        console.log('Connected to API:', apiUrl);
      } else {
        throw new Error('Invalid API response: Expected status "ok" and message "One Nest API is running"');
      }
    } catch (error) {
      setIsConnected(false);
      // Save disconnected status to settings
      await saveSetting('apiConnected', false);
      
      setErrorMessage("Server error, check the API");
      setShowError(true);
      console.error('Connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setShowError(false);
    setErrorMessage('');
    // Save disconnected status to settings
    await saveSetting('apiConnected', false);
    console.log('Disconnected from API');
  };

  const handleSaveConfig = async () => {
    const googleData = {
      credentials: credentialContent,
      sharedFolderId,
      jsonFileId
    };
    await saveIntegration('google', googleData);
    console.log('Saved Google configuration to IndexedDB');
  };

  const handleShowContent = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="integrations-page">
      <PageHeader 
        page="integrations"
      />
      
      {/* Error Alert */}
      {showError && (
        <Alert 
          variant="danger" 
          dismissible 
          onClose={() => setShowError(false)}
          className="mb-3"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMessage}
        </Alert>
      )}
      
      <Card className="mb-3">
        <Card.Body>
          {/* Header with Icon, Name, Status and Actions */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            {/* Left: Icon, Name and Status */}
            <div className="d-flex align-items-center flex-grow-1 flex-md-grow-0 gap-2">
              <i className="bi bi-google fs-4 text-primary"></i>
              <h6 className="mb-0">Google</h6>
              {isConnected ? (
                <small className="text-success">
                  <i className="bi bi-check-circle-fill me-1"></i>
                  Connected
                </small>
              ) : (
                <small className="text-danger">
                  <i className="bi bi-x-circle me-1"></i>
                  Not connected
                </small>
              )}
            </div>
            
            {/* Right: Actions */}
            <div className="d-flex align-items-center gap-2 integration-actions">
              {!isConnected ? (
                <>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="flex-shrink-0"
                  >
                    <i className={`bi ${connecting ? 'bi-arrow-repeat' : 'bi-plug'} me-1`}></i>
                    {connecting ? 'Connecting...' : 'Connect'}
                  </Button>
                </>
              ) : (
                <>
                  {isConnected && (
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={handleDisconnect}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Disconnect
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-google me-2"></i>
            Google Credentials
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {credentialContent ? (
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Key</th>
                    <th style={{ width: '70%' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    try {
                      const jsonData = typeof credentialContent === 'string' 
                        ? JSON.parse(credentialContent) 
                        : credentialContent;
                      
                      return Object.entries(jsonData).map(([key, value]) => (
                        <tr key={key}>
                          <td><strong>{key}</strong></td>
                          <td style={{ 
                            wordBreak: 'break-word',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                          }}>
                            {typeof value === 'object' 
                              ? JSON.stringify(value, null, 2) 
                              : String(value)}
                          </td>
                        </tr>
                      ));
                    } catch (error) {
                      return (
                        <tr>
                          <td colSpan="2" className="text-danger">
                            Error parsing content: {error.message}
                          </td>
                        </tr>
                      );
                    }
                  })()}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted">No content available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Integrations;

