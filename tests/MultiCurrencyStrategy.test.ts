import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiCurrencyStrategy } from '../src/strategies/MultiCurrencyStrategy.js';
import { ExchangeRateService } from '../src/services/ExchangeRateService.js';
import { Transaction } from '../src/models.js';

describe('MultiCurrencyStrategy (Feature 5)', () => {
  let strategy: MultiCurrencyStrategy;

  beforeEach(() => {
    strategy = new MultiCurrencyStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should convert amounts and sum values in target currency', async () => {
  //   const mockRates = { base: 'USD', rates: { EUR: 0.90 } };
  //   const spy = vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: 100.00, category: 'Salary', description: 'Gig', status: 'completed' },
  //     { id: '2', date: '2026-05-02', amount: -50.00, category: 'Food', description: 'Grocery', status: 'completed' },
  //   ];
  //
  //   const result = await strategy.execute(testTransactions, 'EUR');
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('90.00 EUR'); // 100 * 0.90
  //   expect(result).toContain('-45.00 EUR'); // -50 * 0.90
  //   expect(result).toContain('Balance: 45.00 EUR');
  // });

  it('should parse exchange rates and use customParam target currency', async () => {

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-05',
        amount: 100,
        category: 'Salary',
        description: 'Birth',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, 'GBP');
    expect(result).toContain('Target Currency: GBP');
    expect(result).toContain('79.00 GBP');
  });


  it('should default to EUR conversion if currency param is missing or invalid', async () => {
    const mockRates = {
      base: 'USD',
      rates: {
        EUR: 0.92,
        GBP: 0.79,
      },
    };

    vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-06',
        amount: 100,
        category: 'Salary',
        description: 'Job',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, 'JPY');

    expect(result).toContain('Target Currency: EUR');
    expect(result).toContain('92.00 EUR');
  },);


  it.todo('should throw an error if the target currency does not exist in exchange rates', async () => {
    const mockRates = {
      base: 'USD',
      rates: {
        GBP: 0.79,
      },
    };

    vi.spyOn(ExchangeRateService, 'getExchangeRates').mockResolvedValue(mockRates);

    const testTransactions: Transaction[] = [];

    await expect(strategy.execute(testTransactions, 'JPY')).rejects.toThrow('404 Transaction Rate not Found');
  },);


  it.todo('should accurately convert individual transaction amounts to the target currency', async () => {
    
    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: 100,
        category: 'Salary',
        description: 'Job',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -50,
        category: 'Food',
        description: 'Bojangles',
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-05-03',
        amount: 80.98,
        category: 'Gift',
        description: 'Early Birthday',
        status: 'completed',
      },
      {
        id: '4',
        date: '2026-05-04',
        amount: -1.67,
        category: 'Food',
        description: 'Food Lion',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, 'EUR');

    expect(result).toContain('92.00 EUR');
    expect(result).toContain('-46.00 EUR');
    expect(result).toContain(' 74.50 EUR');
    expect(result).toContain('-1.54 EUR');
  }
  );

  it.todo('should calculate and display totals (income, expense, net balance) in both USD and target currency', async () => {

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-05',
        amount: 126.10,
        category: 'Salary',
        description: 'Job',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-06',
        amount: 240.67,
        category: 'Gift',
        description: 'Late Birth',
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-05-07',
        amount: -100,
        category: 'Purchase',
        description: 'Game',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions, 'JPY');

    expect(result).toContain('Income: $366.77 USD');
    expect(result).toContain('56996.06 JPY');

    expect(result).toContain('Expenses: $-100 USD');
    expect(result).toContain('-15540.00 JPY');

    expect(result).toContain('Net Balance: $266.77 USD');
    expect(result).toContain('13818.69 JPY');
  }
  );
});
