import { Container, Card, Button } from 'react-bootstrap';

// This component displays the main sales dashboard layout with
// remaining/starting cash, location, and action buttons.
function OpenShop() {

  const handleTransaction = (type) => {
    // This is a placeholder for your transaction logic.
    console.log(`Recording a ${type}`);
  };

  return (
    <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-start text-center">
      {/* The main card container */}
      <Card className="shadow-sm mt-5 w-75">
        <Card.Body>
          {/* Action buttons */}
          <div className="d-grid gap-3">
            <Button variant="dark" size="lg" onClick={() => handleTransaction('Purchase')}>
              Record a Purchase
            </Button>
            <Button variant="dark" size="lg" onClick={() => handleTransaction('Expense')}>
              Record an Expense
            </Button>
            <Button variant="dark" size="lg" onClick={() => handleTransaction('Debt')}>
              Record a Debt
            </Button>
            <Button variant="outline-dark" size="lg" onClick={() => handleTransaction('History')}>
              Transaction History
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OpenShop;
