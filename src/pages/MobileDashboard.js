import { 
    Container
} from 'react-bootstrap';
import Header from '../components/Header';
import Closed from '../components/Closed';

function MobileDashboard() {
  return (
    <>
    <Container fluid className="p-0 d-flex flex-column min-vh-100">
      <Header />
      <Closed />
    </Container>          
    </>
  );
}

export default MobileDashboard;
