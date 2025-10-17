import InventoryMatrixTable from '../components/InventoryMatrixTable';

function InventoryPage() {
    return (
        <div>
            <h1 className="mb-4">Inventory</h1>
            <div className="d-flex gap-4" style={{ width: '100%' }}>
                <InventoryMatrixTable />
            </div>
        </div>
    );
}

export default InventoryPage;