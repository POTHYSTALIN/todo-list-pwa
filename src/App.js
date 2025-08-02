import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { TodoProvider } from './contexts/TodoContext';
import TodoList from './components/TodoList';
import Categories from './components/Categories';
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
      case 'todos':
      default:
        return <TodoList />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'categories':
        return 'Categories';
      case 'todos':
      default:
        return 'Todo List';
    }
  };

  const getPageIcon = () => {
    switch (currentPage) {
      case 'categories':
        return 'bi-collection';
      case 'todos':
      default:
        return 'bi-check2-square';
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
                <p className="mb-0">Manage your tasks, even when offline!</p>
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
