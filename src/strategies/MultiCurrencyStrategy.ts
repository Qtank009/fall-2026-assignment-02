import { Transaction } from '../models.js';
import { ExchangeRateService } from '../services/ExchangeRateService.js';
import { AuditStrategy } from './AuditStrategy.js';

//Pull test
export class MultiCurrencyStrategy implements AuditStrategy {
  public readonly name = 'Multi-Currency Auditor';
  public readonly description =
    'Converts and aggregates transactions in a foreign currency';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 5 - Implement this strategy.
    // 1. Call ExchangeRateService.getExchangeRates() asynchronously.
    // 2. Identify the target currency from `customParam` (default to 'EUR' if invalid/not provided).
    // 3. Look up the exchange rate for the target currency (throw an error if not found in rates).
    // 4. Convert all transaction amounts to the target currency.
    // 5. Calculate total income, total expenses, and net balance in BOTH USD and target currency.
    // 6. Format and return a text-based audit report detailing conversion metrics, conversion rate used, and transaction summaries in both currencies.

    throw new Error('Method not implemented.');
  }
}
