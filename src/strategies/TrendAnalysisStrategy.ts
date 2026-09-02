import { Transaction } from '../models.js';
import { HistoricalDataService } from '../services/HistoricalDataService.js';
import { AuditStrategy } from './AuditStrategy.js';

// hello i am a robot meow


export class TrendAnalysisStrategy implements AuditStrategy {
  public readonly name = 'Historical Trend Auditor';
  public readonly description =
    'Compares current monthly category spending against historical averages';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 3 - Implement this strategy.
    // 1. Call HistoricalDataService.getHistoricalAverages() asynchronously.
    // 2. Group current expenses (amount < 0) by category and compute category totals.
    // 3. For each category, compare current total spending against the historical average.
    // 4. Calculate the rate of change / variance percentage: ((current - historical) / historical) * 100.
    // 5. Highlight any category with a variance exceeding +/- 20%.
    // 6. Format and return a text-based audit report detailing comparison metrics.

    throw new Error('Method not implemented.');
  }
}
