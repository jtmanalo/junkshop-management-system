import { 
    Container
} from 'react-bootstrap';
import Header from '../components/Header';
import ClosedShop from '../components/ClosedShop';
import OpenShop from '../components/OpenShop';

function MobileDashboard() {
  return (
    <>
    <Container fluid className="p-0 d-flex flex-column min-vh-100">
      <Header />
      {/* <ClosedShop /> */}
      <OpenShop />
    </Container>          
    </>
  );
}

export default MobileDashboard;
