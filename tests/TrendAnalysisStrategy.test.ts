import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrendAnalysisStrategy } from '../src/strategies/TrendAnalysisStrategy.js';
import { HistoricalDataService } from '../src/services/HistoricalDataService.js';
import { Transaction } from '../src/models.js';

describe('TrendAnalysisStrategy (Feature 3)', () => {
  let strategy: TrendAnalysisStrategy;

  beforeEach(() => {
    strategy = new TrendAnalysisStrategy();
    vi.restoreAllMocks();
  });

  it('should group current expenses by category and compute accurate totals', async () => {
    const mockAverages = { Food: 200 };
    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -60.0,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-05',
        amount: -40.0,
        category: 'Food',
        description: 'Restaurant',
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-05-06',
        amount: 500.0,
        category: 'Food',
        description: 'Refund',
        status: 'completed',
      }, // income, should be ignored
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    // 60 + 40 = $100 total Food spend; the $500 credit should NOT be added in
    expect(result).toContain('100.00');
  });

  it('should calculate variance percentage from historical averages correctly', async () => {
    const mockAverages = { Food: 200, Rent: 1000 };
    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -250.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      }, // +25% change
      {
        id: '2',
        date: '2026-05-02',
        amount: -1000.0,
        category: 'Rent',
        description: 'Apartment',
        status: 'completed',
      }, // 0% change
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('25.0'); // (250-200)/200 * 100 = 25%
    expect(result).toContain('0.0'); // (1000-1000)/1000 * 100 = 0%
  });

  it('should highlight categories exceeding positive/negative 20% variance threshold', async () => {
    const mockAverages = { Food: 200, Shopping: 400 };
    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -250.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      }, // +25%, should flag
      {
        id: '2',
        date: '2026-05-02',
        amount: -280.0,
        category: 'Shopping',
        description: 'Clothes',
        status: 'completed',
      }, // -30%, should flag
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Food');
    expect(result).toContain('Shopping');
    expect(result).toContain('FLAGGED');

    // count how many times FLAGGED appears - should be exactly 2 (both categories)
    const flagCount = (result.match(/FLAGGED/g) || []).length;
    expect(flagCount).toBe(2);
  });

  it('should not flag categories within the +/-20% variance threshold', async () => {
    const mockAverages = { Utilities: 95 };
    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -100.0,
        category: 'Utilities',
        description: 'Electric bill',
        status: 'completed',
      }, // ~+5.3%
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Utilities');
    expect(result).not.toContain('FLAGGED');
  });

  it('should handle categories present in current data but missing in historical benchmarks', async () => {
    const mockAverages = { Food: 200 }; // no "Pets" entry on purpose
    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -60.0,
        category: 'Pets',
        description: 'Vet visit',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Pets');
    expect(result).toContain('no historical data');
    // shouldn't crash, and shouldn't try to flag something it has no benchmark for
    expect(result).not.toContain('Pets: current $60.00 vs average $NaN');
  });

  it('should format historical vs current comparisons in a readable report', async () => {
    const mockAverages = { Food: 200 };
    const spy = vi
      .spyOn(HistoricalDataService, 'getHistoricalAverages')
      .mockResolvedValue(mockAverages);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -250.0,
        category: 'Food',
        description: 'Grocery',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain(strategy.name);
    expect(result).toContain(strategy.description);
    expect(result).toContain('current $250.00');
    expect(result).toContain('average $200.00');
  });

  it('should handle an empty transaction list without throwing', async () => {
    const mockAverages = { Food: 200 };
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(
      mockAverages,
    );

    await expect(strategy.execute([])).resolves.toBeTypeOf('string');
  });
});
