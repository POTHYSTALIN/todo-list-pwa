import React from 'react';
import { Alert } from 'react-bootstrap';
import { useTodoContext } from '../contexts/TodoContext';

const NetworkStatus = () => {
  const { networkStatus, syncPending } = useTodoContext();

  if (networkStatus && !syncPending) {
    return null; // Don't show anything when online with no pending syncs
  }

  return (
    <Alert 
      variant={networkStatus ? 'info' : 'warning'} 
      className="position-fixed bottom-0 start-50 translate-middle-x mb-3 d-flex align-items-center"
      style={{ zIndex: 1050, maxWidth: '90%', width: 'auto' }}
    >
      {!networkStatus ? (
        <>
          <i className="bi bi-wifi-off fs-5 me-2"></i>
          <div>
            <strong>You're offline.</strong> Changes will be saved locally and synced when you reconnect.
          </div>
        </>
      ) : syncPending ? (
        <>
          <i className="bi bi-arrow-repeat fs-5 me-2 spin-icon"></i>
          <div>
            <strong>Syncing changes...</strong> Your offline changes are being synchronized.
          </div>
        </>
      ) : null}
    </Alert>
  );
};

export default NetworkStatus; 