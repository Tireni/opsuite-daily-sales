import type { Sale } from '../../shared/sales';
import { formatMoney, formatTime } from '../utils/format';

export function SalesTable({ sales }: { sales: Sale[] }) {
  return <div className="table-scroll"><table>
    <thead><tr><th scope="col">Item</th><th scope="col" className="amount-cell">Amount</th><th scope="col" className="time-cell">Time</th></tr></thead>
    <tbody>{sales.map(sale => <tr key={sale.id}>
      <td>{sale.item}</td><td className="amount-cell">{formatMoney(sale.amount_kobo)}</td><td className="time-cell">{formatTime(sale.sold_at)}</td>
    </tr>)}</tbody>
  </table></div>;
}
