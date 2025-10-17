import SalesPerformanceChart from '../components/SalesPerformanceChart';
import BreakEvenChart from '../components/BreakEvenChart';
import ProfitMarginBarChart from '../components/ProfitMarginBarChart';
import ExpenseBreakdownDonut from '../components/ExpenseBreakdownDonut';
import ExpenseTrendStackedBar from '../components/ExpenseTrendStackedBar';
import LocationAnalysisTable from '../components/LocationAnalysisTable';

function AnalyticsPage() {
    return (
        <div>
            <h1 className="mb-4">Analytics</h1>
            <div className="d-flex gap-4" style={{ width: '100%' }}>
                <SalesPerformanceChart />
                <BreakEvenChart />
            </div>
            <div className="d-flex gap-4" style={{ width: '100%' }}>
                <ProfitMarginBarChart />
                <ExpenseBreakdownDonut />
            </div>
            <div className="d-flex gap-4" style={{ width: '100%' }}>
                <ExpenseTrendStackedBar />
                <LocationAnalysisTable />
            </div>
        </div>
    );
}

export default AnalyticsPage;