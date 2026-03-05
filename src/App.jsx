import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Tenants from './pages/Tenants';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Rooms from './pages/Rooms';
import Settings from './pages/Settings';
import ContractView from './pages/ContractView';
import ContractTemplates from './pages/ContractTemplates';
import ReceiptView from './pages/ReceiptView';
import BulkReceipts from './pages/BulkReceipts';
import Payment from './pages/Payment';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="buildings" element={<Buildings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="billing" element={<Billing />} />
            <Route path="payment" element={<Payment />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/contract/:id" element={<ContractView />} />
          <Route path="/receipt/:room" element={<ReceiptView />} />
          <Route path="/receipts/all" element={<BulkReceipts />} />
          <Route path="/receipts/building/:buildingId" element={<BulkReceipts />} />
          <Route path="/templates" element={<
            DashboardLayout>
            <ContractTemplates />
          </DashboardLayout>
          } />
        </Routes>
      </Router>
    </AppProvider>
  );
}


export default App;
