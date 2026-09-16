import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaxDeductionStrategy } from '../src/strategies/TaxDeductionStrategy.js';
import { TaxConfigService } from '../src/services/TaxConfigService.js';
import { Transaction } from '../src/models.js';

describe('TaxDeductionStrategy (Feature 4)', () => {
  let strategy: TaxDeductionStrategy;

  const testTransactions: Transaction[] = [
    {
      id: '1',
      date: '2026-05-01',
      amount: -200,
      category: 'Charity',
      description: 'Donation',
      status: 'completed',
    },
    {
      id: '2',
      date: '2026-05-02',
      amount: -100,
      category: 'Business',
      description: 'Office supplies',
      status: 'completed',
    },
    {
      id: '3',
      date: '2026-05-03',
      amount: -50,
      category: 'Food',
      description: 'Groceries',
      status: 'completed',
    },
    {
      id: '4',
      date: '2026-05-04',
      amount: 100,
      category: 'Charity',
      description: 'Refund',
      status: 'completed',
    },
  ];

  beforeEach(() => {
    strategy = new TaxDeductionStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should compute tax savings correctly based on rate and deductible categories', async () => {
  //   const mockConfig = { standardTaxRate: 0.10, deductibleCategories: ['Medical', 'Charity'] };
  //   const spy = vi.spyOn(TaxConfigService, 'getTaxConfig').mockResolvedValue(mockConfig);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -200.00, category: 'Charity', description: 'Donation', status: 'completed' }, // Deductible
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Non-deductible
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Deductions: $200.00'); // Sum of Charity
  //   expect(result).toContain('Savings: $20.00'); // $200 * 0.10
  // });

  it('should filter only the categories specified as deductible in the config', async () => {
    const mockConfig = {
      standardTaxRate: 0.10,
      deductibleCategories: ['Business', 'Charity'],
    };

    const spy = vi
      .spyOn(TaxConfigService, 'getTaxConfig')
      .mockResolvedValue(mockConfig);

    const result = await strategy.execute(testTransactions);

    expect(spy).toHaveBeenCalled();
    expect(result).toContain('Charity');
    expect(result).toContain('Business');
    expect(result).not.toContain('Grocery');
  });

  it('should sum total eligible tax deductions correctly', async () => {
    const mockConfig = {
      standardTaxRate: 0.08,
      deductibleCategories: ['Business', 'Charity'],
    };

    vi.spyOn(TaxConfigService, 'getTaxConfig')
      .mockResolvedValue(mockConfig);

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Deductions: $300.00');
  });

  it('should calculate estimated tax savings using standardTaxRate', async () => {
    const mockConfig = {
      standardTaxRate: 0.10,
      deductibleCategories: ['Business', 'Charity'],
    };

    vi.spyOn(TaxConfigService, 'getTaxConfig')
      .mockResolvedValue(mockConfig);

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Savings: $30.00');
  });

  it('should calculate estimated VAT/sales tax paid on non-deductible expense transactions',
    async () => {
      const mockConfig = {
        standardTaxRate: 0.10,
        deductibleCategories: ['Business', 'Charity'],
      };

      vi.spyOn(TaxConfigService, 'getTaxConfig')
        .mockResolvedValue(mockConfig);

      const result = await strategy.execute(testTransactions);

      expect(result).toContain('Sales Tax: $5.00');
    },
  );

  it(
    'should structure report to show both aggregates and itemized deductible transactions',
    async () => {
      const mockConfig = {
        standardTaxRate: 0.10,
        deductibleCategories: ['Business', 'Charity'],
      };

      vi.spyOn(TaxConfigService, 'getTaxConfig')
        .mockResolvedValue(mockConfig);

      const result = await strategy.execute(testTransactions);
      expect(result).toContain('Deductions: $300.00');
      expect(result).toContain('Savings: $30.00');
      expect(result).toContain('Sales Tax: $5.00');
      
      expect(result).toContain('Charity - Donation');
      expect(result).toContain('Business - Office supplies');
    },
  );
});
