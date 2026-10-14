import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SaleDraft } from '../server/domain/SaleDraft.js';
const validateSale = (body: unknown) => {
  const sale = SaleDraft.parse(body);
  return { item: sale.item, amountKobo: sale.amountKobo, requestId: sale.requestId };
};
const requestId = '11111111-1111-4111-8111-111111111111';
test('converts naira decimals to exact integer kobo and trims names', () => {
  assert.deepEqual(validateSale({ item: '  Rice  ', amount: '1250.25', requestId }), { item: 'Rice', amountKobo: 125025, requestId });
  assert.equal(validateSale({ item: 'Soap', amount: '0.01', requestId }).amountKobo, 1);
  assert.equal(validateSale({ item: 'Soap', amount: '99999999.99', requestId }).amountKobo, 9999999999);
});
test('rejects invalid and oversized amounts without coercion', () => {
  for (const amount of ['0', '-1', '1.001', '1e3', 'NaN', '100000000', '', '1,000', 12, null]) {
    assert.throws(() => validateSale({ item: 'Rice', amount, requestId }));
  }
});
test('rejects empty names, control characters, oversized names and invalid IDs', () => {
  for (const item of ['', '  ', 'a'.repeat(121), 'a\nb', null]) assert.throws(() => validateSale({ item, amount: '1', requestId }));
  assert.throws(() => validateSale({ item: 'Rice', amount: '1', requestId: 'bad-id' }));
});
