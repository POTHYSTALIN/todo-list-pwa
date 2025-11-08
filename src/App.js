import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { TodoProvider } from './contexts/TodoContext';
import TodoList from './components/TodoList';
import Categories from './components/Categories';
import Integrations from './components/Integrations';
import Import from './components/Import';
import Export from './components/Export';
import SideDrawer from './components/SideDrawer';
import NetworkStatus from './components/NetworkStatus';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState('todos');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'categories':
        return <Categories />;
      case 'integrations':
        return <Integrations />;
      case 'import':
        return <Import />;
      case 'export':
        return <Export />;
      case 'todos':
      default:
        return <TodoList />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
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

  const getPageIcon = () => {
    switch (currentPage) {
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

  const getPageSubtitle = () => {
    switch (currentPage) {
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

  return (
    <TodoProvider>
      <div className="App">
        <header className="App-header bg-primary text-white py-3 mb-4">
          <Container>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="mb-0">
                  <i className={`${getPageIcon()} me-2`}></i>
                  {getPageTitle()}
                </h1>
                <p className="mb-0">{getPageSubtitle()}</p>
              </div>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setShowDrawer(true)}
              >
                <i className="bi bi-list"></i>
              </Button>
            </div>
          </Container>
        </header>
        
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              {renderCurrentPage()}
            </Col>
          </Row>
        </Container>
        
        <NetworkStatus />
        
        <SideDrawer
          show={showDrawer}
          onHide={() => setShowDrawer(false)}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      </div>
    </TodoProvider>
  );
}

export default App;
