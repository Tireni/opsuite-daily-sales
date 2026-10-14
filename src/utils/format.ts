const currencyFormatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });
const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', hour12: true,
});
const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  timeZone: 'Africa/Lagos', day: '2-digit', month: 'short', year: 'numeric',
});

export const formatMoney = (kobo: number) => currencyFormatter.format(kobo / 100);
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso));
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
