import { Transaction } from '../models.js';
import { BudgetService } from '../services/BudgetService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class BudgetLimitStrategy implements AuditStrategy {
  public readonly name = 'Budget Limit Auditor';
  public readonly description =
    'Checks category spending against monthly budget limits';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 1 - Implement this strategy.
    // 1. Call BudgetService.getCategoryBudgets() asynchronously.

    const budgets = await BudgetService.getCategoryBudgets();
    console.log(budgets);
    // 2. Group expenses (amounts < 0) by category and compute total spending for each category
    
    const spendingByCategory: Record<string, number> = {};
    for (const t of transactions) {
      if (t.amount < 0) {
        const category = t.category;
        if (!spendingByCategory[category]) {
          spendingByCategory[category] = 0;
        }
        spendingByCategory[category] += Math.abs(t.amount);
      }
    }

    //used to test functionality of grouping expenses by category
    //console.log(spendingByCategory);

    // 3. Compare spending against the fetched limits.

    const overBudgetCategories: string[] = [];

    for (const category in spendingByCategory) {

      const spending = spendingByCategory[category];
      const limit = budgets[category];

      if(limit === undefined) {
        console.log(category, "has no budget limit defined.");
        continue;
      }

      console.log(category, "spent:",spending, "limit", limit);

      // 4. Identify overages (categories where spending exceeds the budget).

      if (spending > limit) {

        const overage = spending - limit;
        const percent = (spending / limit) * 100;

        overBudgetCategories.push(category);

        console.log(category, "over budget by:", overage.toFixed(2), "which is", percent.toFixed(2) + "%");
      }
    }


    


    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.

    const report: string[] = [];

    report.push('Budget Limit Audit Report');
    report.push('===========================');
    report.push('');





    throw new Error('Method not implemented.');
  }
}
