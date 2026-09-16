import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetLimitStrategy } from '../src/strategies/BudgetLimitStrategy.js';
import { BudgetService } from '../src/services/BudgetService.js';
import { Transaction } from '../src/models.js';

describe('BudgetLimitStrategy (Feature 1)', () => {
  let strategy: BudgetLimitStrategy;

  beforeEach(() => {
    strategy = new BudgetLimitStrategy();
    vi.restoreAllMocks();
  });

  
  it('should correctly identify categories that are over budget', async () => {
    // 1. Mock the BudgetService asynchronously
    const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({Food: 200});
  
    // 2. Set up test transactions
    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -60.00, category: 'Food', description: 'Grocery', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -40.00, category: 'Food', description: 'Apartment', status: 'completed' }, 
      { id: '3', date: '2026-05-03', amount: 500.00, category: 'Food', description: 'Refund', status: 'completed' },
    ];
  
    // 3. Execute
    const result = await strategy.execute(testTransactions);
  
    // 4. Assert
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toContain('Food: spent $100.00, budget limit $200.00'); // or whatever formatting you choose
  });

  it('should calculate overage amounts and percentage exceeded', async ()=> {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({Food: 100});

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -150.00, category: 'Food', description: 'Grocery', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Food: over budget by $50.00, which is 150.00%');
  });
  

  it('should list the specific transactions contributingto categories over budget', async ()=> {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({Food: 100, Rent: 1000});

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -150.00, category: 'Food', description: 'Grocery', status: 'completed' },
      { id: '2', date: '2026-05-02', amount: -900.00, category: 'Rent', description: 'Apartment', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('2026-05-01 | Food | Grocery | $150.00');
    //Rent is under budget, so its transaction is NOT listed
    expect(result).not.toContain('Apartment');

  });
  



  it('should Handle scenarios where no categories are over budget', async ()=> {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({Food: 100});

    const testTransactions: Transaction[] = [
      { id: '1', date: '2026-05-01', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' },
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('No categories are over budget.');
    expect(result).not.toContain('over budget by');

  });

  it('should handle empty transaction list gracefully', async ()=> {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({Food: 100});

     const result = await strategy.execute([]);


    expect(result).toContain('No expenses found.');
    expect(result).toContain('No categories are over budget');

  });
});
