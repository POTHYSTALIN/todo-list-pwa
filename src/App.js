import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { TodoProvider } from './contexts/TodoContext';
import TodoList from './components/TodoList';
import Categories from './components/Categories';
import Integrations from './components/Integrations';
import Import from './components/Import';
import Export from './components/Export';
import Settings from './components/Settings';
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
      case 'settings':
        return <Settings />;
      case 'todos':
      default:
        return <TodoList />;
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
                  <i className="bi bi-box-seam me-2"></i>
                  One Nest
                </h1>
                <p className="mb-0">Keep everything in One Nest</p>
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
