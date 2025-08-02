import React from 'react';
import { Offcanvas, Nav } from 'react-bootstrap';

const SideDrawer = ({ show, onHide, onNavigate, currentPage }) => {
  const menuItems = [
    { id: 'todos', label: 'Todos', icon: 'bi-check2-square' },
    { id: 'categories', label: 'Categories', icon: 'bi-collection' }
  ];

  return (
    <Offcanvas show={show} onHide={onHide} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <i className="bi bi-list me-2"></i>
          Menu
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onHide();
              }}
              className={`d-flex align-items-center py-3 ${
                currentPage === item.id ? 'active fw-bold' : ''
              }`}
            >
              <i className={`${item.icon} me-3 fs-5`}></i>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SideDrawer; 