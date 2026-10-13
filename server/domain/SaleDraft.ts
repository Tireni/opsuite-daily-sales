/** An immutable, validated sale. Invalid input cannot create an instance. */
export class SaleDraft {
  readonly #item: string;
  readonly #amountKobo: number;
  readonly #requestId: string;

  private constructor(item: string, amountKobo: number, requestId: string) {
    this.#item = item;
    this.#amountKobo = amountKobo;
    this.#requestId = requestId;
  }

  get item() { return this.#item; }
  get amountKobo() { return this.#amountKobo; }
  get requestId() { return this.#requestId; }

  static parse(body: unknown): SaleDraft {
    if (!body || typeof body !== 'object') throw new Error('Enter an item name and a valid amount.');
    const { item, amount, requestId } = body as Record<string, unknown>;
    if (typeof item !== 'string' || !item.trim() || item.trim().length > 120 || /[\x00-\x1f\x7f]/.test(item)) throw new Error('Enter an item name between 1 and 120 characters.');
    if (typeof amount !== 'string' || !/^\d{1,8}(\.\d{1,2})?$/.test(amount)) throw new Error('Enter a valid amount with up to two decimal places.');
    const [whole, fraction = ''] = amount.split('.');
    const amountKobo = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
    if (amountKobo < 1 || amountKobo > 9999999999) throw new Error('Amount must be between ₦0.01 and ₦99,999,999.99.');
    if (typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new Error('Invalid submission. Please refresh and try again.');
    return new SaleDraft(item.trim(), amountKobo, requestId);
  }
}
