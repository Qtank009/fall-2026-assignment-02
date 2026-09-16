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

    // Step one get our data from our HistoricalDataService, Assign it to HistoricalAverages
    const historicalAverages: HistoricalAverages =
      await HistoricalDataService.getHistoricalAverages();

    // Step two group current expenses
    const currentTotals: { [key: string]: number } = {};

    // looping through our transaction array, and adding total expenses (negative transactions)
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];

      if (tx.amount < 0) {
        currentTotals[tx.category] =
          (currentTotals[tx.category] ?? 0) + Math.abs(tx.amount);
      }
    }

    //STEP THREE, FOUR, and FIVE

    //initilize variables
    const categories = Object.keys(currentTotals);
    const reportLines: string[] = [];
    const flaggedCategories: string[] = [];
    const growthCategories: string[] = [];
    const savingsCategories: string[] = [];

    // loop through our array of expenses we just made, then compare each category to our old data
    for (let i = 0; i < categories.length; i++) {
      // variables
      const category = categories[i];
      const currentAmount = currentTotals[category];
      const historicalAmount = historicalAverages[category];

      // if we dont have historcal data, just reports the current amount
      if (historicalAmount == undefined || historicalAmount == 0) {
        reportLines.push(
          category + ': $' + currentAmount.toFixed(2) + ' (no historical data)',
        );
        continue;
      }

      // difference and change for out data report
      const difference = currentAmount - historicalAmount;
      const percentChange = (difference / historicalAmount) * 100;

      // if our change is greater than 20% flag it

      let isFlagged = false;
      if (percentChange > 20) {
        isFlagged = true;
        growthCategories.push(category);
      } else if (percentChange < -20) {
        isFlagged = true;
        savingsCategories.push(category);
      }

      // report line syntax
      let line =
        category +
        ': current $' +
        currentAmount.toFixed(2) +
        ' vs average $' +
        historicalAmount.toFixed(2) +
        ' (' +
        percentChange.toFixed(1) +
        ' % change)';

      // if our change was flagged, we show it on the report
      if (isFlagged) {
        line = line + '  <--- FLAGGED';
        flaggedCategories.push(category);
      }

      reportLines.push(line);
    }

    //STEP 6

    // writing the full report now

    //title + discription
    let report = '=== ' + this.name + ' ===\n\n';
    report = report + this.description + ' \n\n\n';

    // writing categories that we flagged
    if (flaggedCategories.length > 0) {
      report += '\nSignificant Growth Categories (> +20%):\n';
      report +=
        growthCategories.length > 0
          ? growthCategories.join(', ') + '\n'
          : 'None\n\n';

      report += '\nSignificant Savings Categories (< -20%):\n';
      report +=
        savingsCategories.length > 0
          ? savingsCategories.join(', ') + '\n'
          : 'None\n\n';
    } else {
      report =
        report +
        'No categories reported with a greater change exceeding the 20% threshold\n\n';
    }
    
    // writing our reportLines
    for (let i = 0; i < reportLines.length; i++) {
      report = report + reportLines[i] + '\n';
    }

    return report;
  }
}
