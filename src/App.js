import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { TodoProvider } from './contexts/TodoContext';
import TodoList from './components/TodoList';
import NetworkStatus from './components/NetworkStatus';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <TodoProvider>
      <div className="App">
        <header className="App-header bg-primary text-white py-3 mb-4">
          <Container>
            <h1><i className="bi bi-check2-square me-2"></i>Todo List</h1>
            <p className="mb-0">Manage your tasks, even when offline!</p>
          </Container>
        </header>
        
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <TodoList />
            </Col>
          </Row>
        </Container>
        
        <NetworkStatus />
      </div>
    </TodoProvider>
  );
}

export default App;
