import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Modal, Table } from 'react-bootstrap';
import { saveIntegration, getIntegration, deleteIntegration } from '../utils/db';

const Integrations = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [credentialContent, setCredentialContent] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load saved credentials on mount
    const loadSavedCredentials = async () => {
      const content = await getIntegration('google');
      if (content) {
        setIsConnected(true);
        setCredentialContent(content);
        console.log('Loaded credentials from IndexedDB');
      }
    };
    loadSavedCredentials();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name);
    }
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      // Read the file content directly
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileContent = event.target.result;
        
        await saveIntegration('google', fileContent);
        setIsConnected(true);
        setCredentialContent(fileContent);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        console.log('Saved credentials content to IndexedDB');
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDisconnect = async () => {
    await deleteIntegration('google');
    setIsConnected(false);
    setCredentialContent('');
    console.log('Disconnected and removed credentials from IndexedDB');
  };

  const handleShowContent = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="integrations-page">
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <i className="bi bi-google fs-4 me-3 text-primary"></i>
              <div className="d-flex align-items-center gap-2">
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
            </div>
            <div className="d-flex align-items-center gap-2">
              {!isConnected ? (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    style={{ display: 'none' }}
                    id="google-credentials-file"
                  />
                  {selectedFile && (
                    <small className="text-muted">{selectedFile.name}</small>
                  )}
                  <label htmlFor="google-credentials-file" className="btn btn-outline-secondary btn-sm mb-0">
                    <i className="bi bi-file-earmark me-1"></i>
                    Choose File
                  </label>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!selectedFile}
                  >
                    <i className="bi bi-plug me-1"></i>
                    Connect
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="info" 
                    size="sm"
                    onClick={handleShowContent}
                  >
                    <i className="bi bi-eye me-1"></i>
                    View
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Disconnect
                  </Button>
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

