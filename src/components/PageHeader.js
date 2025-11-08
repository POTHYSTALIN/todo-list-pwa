import React from 'react';
import { Button } from 'react-bootstrap';

const PageHeader = ({ 
  page,
  statusBadges = null,
  actions = [] 
}) => {
  const getPageIcon = (page) => {
    switch (page) {
      case 'categories':
        return 'bi-collection';
      case 'integrations':
        return 'bi-plug';
      case 'import':
        return 'bi-upload';
      case 'export':
        return 'bi-download';
      case 'todos':
      default:
        return 'bi-check2-square';
    }
  };

  const getPageTitle = (page) => {
    switch (page) {
      case 'categories':
        return 'Categories';
      case 'integrations':
        return 'Integrations';
      case 'import':
        return 'Import';
      case 'export':
        return 'Export';
      case 'todos':
      default:
        return 'Todos';
    }
  };

  const getPageSubtitle = (page) => {
    switch (page) {
      case 'categories':
        return 'Manage the categories that can be applied to different entities';
      case 'integrations':
        return 'Connect external services';
      case 'import':
        return 'Import data from JSON';
      case 'export':
        return 'Export all your data as JSON';
      case 'todos':
      default:
        return 'Manage your tasks, even when offline!';
    }
  };

  const displayIcon = getPageIcon(page);
  const displayTitle = getPageTitle(page);
  const displaySubtitle = getPageSubtitle(page);

  return (
    <div className="page-header mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <h2 className="mb-0">
              <i className={`bi ${displayIcon} me-2`}></i>
              {displayTitle}
            </h2>
            {statusBadges && (
              <span className="network-status">
                {statusBadges}
              </span>
            )}
          </div>
          <p className="text-muted mb-0">{displaySubtitle}</p>
        </div>
        {actions.length > 0 && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                disabled={action.disabled}
                className="btn-icon-text"
                title={action.title}
              >
                {action.icon && <i className={`bi ${action.icon}`}></i>}
                {action.label && <span className="btn-text">{action.label}</span>}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

