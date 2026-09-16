// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';
// import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
// import { Transaction } from '../src/models.js';

// describe('AnomalyDetectionStrategy (Feature 2)', () => {
//   let strategy: AnomalyDetectionStrategy;

//   beforeEach(() => {
//     strategy = new AnomalyDetectionStrategy();
//     vi.restoreAllMocks();
//   });

//   //Example of how to write and mock in your tests:
//   //
//   // it('should detect outlier transactions exceeding threshold', async () => {
//   //   const mockRules = { maxTransactionAmount: 500.00, flaggedStatuses: ['flagged'] };
//   //   const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
//   //
//   //   const testTransactions: Transaction[] = [
//   //     { id: '1', date: '2026-05-01', amount: -600.00, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
//   //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
//   //   ];
//   //
//   //   const result = await strategy.execute(testTransactions);
//   //
//   //   expect(spy).toHaveBeenCalled();
//   //   expect(result).toContain('Laptop');
//   //   expect(result).toContain('Outlier');
//   // });

//   it.todo(
//     'should detect outlier transactions exceeding the configured max amount limit',
//   );

//   it.todo(
//     'should identify duplicate transactions sharing identical date, amount, category, and description',
//   );

//   it.todo(
//     'should flag transactions matching standard flagged statuses in the rules',
//   );

//   it.todo(
//     'should calculate correct transaction anomaly rates and total flagged valuation',
//   );

//   it.todo(
//     'should output a clean, readable text audit report detailing warnings',
//   );
// });

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Transaction } from '../src/models.ts';
import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';

describe('AnomalyDetectionStrategy (Feature 2)', () => {
  let strategy: AnomalyDetectionStrategy;

  beforeEach(() => {
    strategy = new AnomalyDetectionStrategy();
    vi.restoreAllMocks();
  });

  //Example of how to write and mock in your tests:
  //
  // it('should detect outlier transactions exceeding threshold', async () => {
  //   const mockRules = { maxTransactionAmount: 500.00, flaggedStatuses: ['flagged'] };
  //   const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -600.00, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Laptop');
  //   expect(result).toContain('Outlier');
  // });

  it('should detect outlier transactions exceeding the configured max amount limit', async () => {
    const mockRules = {
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'] as Transaction['status'][],
    };
    const spy = vi
      .spyOn(AnomalyRulesService, 'getRules')
      .mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -600.0,
        category: 'Shopping',
        description: 'Laptop',
        status: 'completed',
      }, // Outlier
      {
        id: '2',
        date: '2026-05-02',
        amount: -100.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      }, // Normal
      {
        id: '3',
        date: '2026-05-03',
        amount: -500.0,
        category: 'Travel',
        description: 'Flight',
        status: 'completed',
      }, // Exactly at limit - NOT an outlier
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Laptop');
    expect(result).toContain('Outlier');
    expect(result).not.toContain('Grocery');
    expect(result).not.toContain('Flight');
  });

  it('should identify duplicate transactions sharing identical date, amount, category, and description', async () => {
    const mockRules = {
      maxTransactionAmount: 1000.0,
      flaggedStatuses: ['flagged'] as Transaction['status'][],
    };
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -45.0,
        category: 'Food',
        description: 'Coffee Beans',
        status: 'completed',
      }, // Duplicate
      {
        id: '2',
        date: '2026-05-01',
        amount: -45.0,
        category: 'Food',
        description: 'Coffee Beans',
        status: 'completed',
      }, // Duplicate
      {
        id: '3',
        date: '2026-05-01',
        amount: -45.0,
        category: 'Food',
        description: 'Tea Leaves',
        status: 'completed',
      }, // Different description - NOT a duplicate
      {
        id: '4',
        date: '2026-05-02',
        amount: -45.0,
        category: 'Food',
        description: 'Coffee Beans',
        status: 'completed',
      }, // Different date - NOT a duplicate
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Duplicate');
    expect(result).toContain('Coffee Beans');
    expect(result).toContain('ID 1');
    expect(result).toContain('ID 2');
  });

  it('should flag transactions matching standard flagged statuses in the rules', async () => {
    const mockRules = {
      maxTransactionAmount: 1000.0,
      flaggedStatuses: ['flagged'] as Transaction['status'][],
    };
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -75.0,
        category: 'Utilities',
        description: 'Suspicious Charge',
        status: 'flagged',
      }, // Flagged
      {
        id: '2',
        date: '2026-05-02',
        amount: -50.0,
        category: 'Food',
        description: 'Lunch',
        status: 'completed',
      }, // Normal
      {
        id: '3',
        date: '2026-05-03',
        amount: -30.0,
        category: 'Transport',
        description: 'Bus Pass',
        status: 'pending',
      }, // Pending, not in flaggedStatuses
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Suspicious Charge');
    expect(result).toContain('flagged');
    expect(result).not.toContain('Bus Pass');
  });

  it('should calculate correct transaction anomaly rates and total flagged valuation', async () => {
    const mockRules = {
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'] as Transaction['status'][],
    };
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -800.0,
        category: 'Shopping',
        description: 'Television',
        status: 'completed',
      }, // Outlier only
      {
        id: '2',
        date: '2026-05-02',
        amount: -200.0,
        category: 'Utilities',
        description: 'Odd Charge',
        status: 'flagged',
      }, // Flagged only
      {
        id: '3',
        date: '2026-05-03',
        amount: -100.0,
        category: 'Food',
        description: 'Dinner',
        status: 'completed',
      }, // Normal
      {
        id: '4',
        date: '2026-05-04',
        amount: -50.0,
        category: 'Food',
        description: 'Snacks',
        status: 'completed',
      }, // Normal
    ];

    const result = await strategy.execute(testTransactions);

    // 2 of 4 transactions are anomalous = 50%
    expect(result).toContain('50.00%');
    expect(result).toContain('Total Anomalous Transactions: 2');
    expect(result).toContain('Total Transactions: 4');
    // 800 + 200 = 1000.00 total flagged value
    expect(result).toContain('$1000.00');
  });

  it('should output a clean, readable text audit report detailing warnings', async () => {
    const mockRules = {
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'] as Transaction['status'][],
    };
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -900.0,
        category: 'Shopping',
        description: 'Furniture',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -60.0,
        category: 'Food',
        description: 'Groceries',
        status: 'flagged',
      },
      {
        id: '3',
        date: '2026-05-02',
        amount: -60.0,
        category: 'Food',
        description: 'Groceries',
        status: 'flagged',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // Report is a non-empty string with all required sections
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Outlier Transactions');
    expect(result).toContain('Duplicate Transaction Sets');
    expect(result).toContain('Flagged Status Transactions');
    expect(result).toContain('Summary');
    expect(result).toContain('Anomaly Rate');

    // Multi-line, readable structure
    expect(result.split('\n').length).toBeGreaterThan(5);
  });

  it('should handle an empty transaction list without errors', async () => {
    const mockRules = {
      maxTransactionAmount: 500.0,
      flaggedStatuses: ['flagged'] as Transaction['status'][],
    };
    vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);

    const result = await strategy.execute([]);

    expect(result).toContain('Total Transactions: 0');
    expect(result).toContain('0.00%');
    expect(result).toContain('None found.');
  });
});