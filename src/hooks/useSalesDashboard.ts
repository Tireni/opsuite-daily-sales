import { useCallback, useEffect, useState } from 'react';
import type { SalesDashboard } from '../../shared/sales';
import type { SalesClient } from '../api/SalesClient';

export function useSalesDashboard(client: SalesClient) {
  const [dashboard, setDashboard] = useState<SalesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try { setDashboard(await client.getDashboard()); }
    catch (error) { setError((error as Error).message); }
    finally { setLoading(false); }
  }, [client]);

  useEffect(() => {
    void refresh();
    const refreshVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    const interval = window.setInterval(refreshVisible, 60000);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [client, refresh]);

  return { dashboard, loading, error, refresh };
}

export type DashboardState = ReturnType<typeof useSalesDashboard>;
