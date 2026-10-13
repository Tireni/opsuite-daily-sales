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
    let active = true;
    const start = async () => {
      const token = new URLSearchParams(window.location.hash.slice(1)).get('access');
      if (token) {
        history.replaceState(null, '', window.location.pathname);
        try { await client.openAccess(token); }
        catch (error) {
          if (active) { setError((error as Error).message); setLoading(false); }
          return;
        }
      }
      if (active) await refresh();
    };
    void start();
    const refreshVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    const interval = window.setInterval(refreshVisible, 60000);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [client, refresh]);

  return { dashboard, loading, error, refresh };
}

export type DashboardState = ReturnType<typeof useSalesDashboard>;
