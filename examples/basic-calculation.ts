import { SalesTaxClient } from 'salestax-node';

const client = SalesTaxClient.fromEnv();

const tax = await client.tax.calculate({ zipCode: '90210', amount: 100 });
console.log(`Tax:   $${tax.taxAmount?.toFixed(2)}`);
console.log(`Total: $${tax.totalAmount?.toFixed(2)}`);