import { salesClient } from './api/SalesClient';
import { AppNavigation } from './components/AppNavigation';
import { useSalesDashboard } from './hooks/useSalesDashboard';
import { DashboardPage } from './pages/DashboardPage';
import { RecordSalePage } from './pages/RecordSalePage';

export function App() {
  const recording = window.location.pathname === '/record';
  const state = useSalesDashboard(salesClient);

  return <main>
    <div className="app-name"><h1>Daily Sales Log</h1></div>
    <AppNavigation recording={recording}/>
    <div className="page-heading"><h2>{recording ? 'Record a sale' : 'Sales dashboard'}</h2></div>
    {recording ? <RecordSalePage client={salesClient} state={state}/> : <DashboardPage {...state}/>}
  </main>;
}
