import { useRef, useState, type FormEvent } from 'react';
import type { SalesClient } from '../api/SalesClient';
import type { DashboardState } from '../hooks/useSalesDashboard';
import { PriceInput } from '../components/PriceInput';
import { SuccessDialog } from '../components/SuccessDialog';

interface RecordSalePageProps {
  client: SalesClient;
  state: DashboardState;
}

export function RecordSalePage({ client, state: { dashboard, loading, error, refresh } }: RecordSalePageProps) {
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  const itemInput = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault(); setFormError('');
    if (!item.trim()) { setFormError('Enter an item name.'); itemInput.current?.focus(); return; }
    if (!/^\d{1,8}$/.test(amount) || Number(amount) <= 0) { setFormError('Enter a whole amount greater than zero, up to 99,999,999.'); return; }
    setSaving(true);
    try {
      await client.recordSale({ item, amount, requestId: requestId.current });
      setItem(''); setAmount(''); requestId.current = crypto.randomUUID(); setSuccess(true);
    } catch (error) { setFormError((error as Error).message); }
    finally { setSaving(false); }
  }

  return <>
    <section className="sale-panel" aria-label="Record a sale">
      {error && <div role="alert" className="message error">{error} <button className="retry" onClick={() => void refresh()}>Try again</button></div>}
      {loading && !dashboard && <p role="status">Loading…</p>}
      <form onSubmit={submit} noValidate>
        <label htmlFor="item">Item name</label>
        <input ref={itemInput} id="item" name="item" maxLength={120} value={item} disabled={saving}
          onChange={event => { setItem(event.target.value); requestId.current = crypto.randomUUID(); }}
          autoComplete="off" aria-describedby={formError ? 'form-error' : undefined}/>
        <PriceInput value={amount} disabled={saving} onChange={value => { setAmount(value); requestId.current = crypto.randomUUID(); }}/>
        {formError && <p id="form-error" role="alert" className="message error">{formError}</p>}
        <button className="primary" type="submit" disabled={saving || !dashboard || !!error}>{saving ? 'Saving sale…' : 'Record sale'}</button>
      </form>
    </section>
    <SuccessDialog open={success} onClose={() => { setSuccess(false); itemInput.current?.focus(); }}/>
  </>;
}
