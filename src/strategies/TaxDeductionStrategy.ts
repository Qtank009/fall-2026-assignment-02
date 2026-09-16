import { Transaction } from '../models.js';
import { TaxConfigService } from '../services/TaxConfigService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class TaxDeductionStrategy implements AuditStrategy {
  public readonly name = 'Tax & Deductions Auditor';
  public readonly description =
    'Identifies eligible tax-deductible expenses and estimates savings';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 4 - Implement this strategy.
    // 1. Call TaxConfigService.getTaxConfig() asynchronously.
    // 2. Filter expenses (amount < 0) that belong to eligible tax-deductible categories.
    // 3. Sum total deductible expenses.
    // 4. Estimate tax savings based on the standard tax rate: total deductible * taxRate.
    // 5. Estimate sales tax/VAT paid on NON-deductible expenses using standard tax rate.
    // 6. Format and return a text-based audit report detailing total deductions, savings, VAT estimates, and eligible transactions.

    const taxConfig = await TaxConfigService.getTaxConfig();

    const deductibleTransactions = transactions.filter(
      transaction => transaction.amount < 0 &&
                     taxConfig.deductibleCategories.includes(transaction.category),
    );

    const totalDeductibleExpenses = Math.abs(
      deductibleTransactions.reduce(
        (total, transaction) => total + transaction.amount,
        0
      )
    );

    const taxSavings = totalDeductibleExpenses * taxConfig.standardTaxRate;

    throw new Error('Method not implemented.');
  }
}
