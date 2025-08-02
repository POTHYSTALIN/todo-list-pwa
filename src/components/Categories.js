import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Categories = () => {
  const sampleCategories = [
    {
      id: 1,
      name: 'Work',
      description: 'Tasks related to your professional work',
      color: 'primary',
      count: 5
    },
    {
      id: 2,
      name: 'Personal',
      description: 'Personal tasks and errands',
      color: 'success',
      count: 3
    },
    {
      id: 3,
      name: 'Shopping',
      description: 'Shopping lists and purchases',
      color: 'warning',
      count: 2
    },
    {
      id: 4,
      name: 'Health',
      description: 'Health and fitness related tasks',
      color: 'info',
      count: 1
    }
  ];

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="mb-4">
            <h2 className="text-center mb-3">
              <i className="bi bi-collection me-2"></i>
              Categories
            </h2>
            <p className="text-muted text-center">
              Organize your todos into different categories for better management
            </p>
          </div>
          
          <Row>
            {sampleCategories.map((category) => (
              <Col key={category.id} xs={12} sm={6} lg={6} className="mb-3">
                <Card className={`border-${category.color} h-100`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <Card.Title className={`text-${category.color} mb-2`}>
                          <i className={`bi bi-tag me-2`}></i>
                          {category.name}
                        </Card.Title>
                        <Card.Text className="text-muted small">
                          {category.description}
                        </Card.Text>
                      </div>
                      <span className={`badge bg-${category.color} rounded-pill`}>
                        {category.count} tasks
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-4">
            <p className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              This is a sample categories page. In a real application, you would be able to create, edit, and manage your todo categories here.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Categories; 