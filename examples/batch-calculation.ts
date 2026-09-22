import { SalesTaxClient } from 'salestax-node';

const client = SalesTaxClient.fromEnv();

const transactions = [
  { zipCode: '90210', amount: 100 },
  { zipCode: '10001', amount: 250 },
  { zipCode: '60601', amount: 75.5 },
];

const result = await client.tax.calculateBatch(transactions, {
  idempotencyKey: 'order-2026-0922-001',
});

result.results.forEach((calc, i) => {
  console.log(`#${i}: tax=$${calc.taxAmount?.toFixed(2)} total=$${calc.totalAmount?.toFixed(2)}`);
});