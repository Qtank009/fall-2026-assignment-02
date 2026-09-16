import { Transaction } from '../models.js';
import { AnomalyRulesService } from '../services/AnomalyRulesService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class AnomalyDetectionStrategy implements AuditStrategy {
  public readonly name = 'Anomaly & Duplicate Auditor';
  public readonly description =
    'Detects transactions exceeding thresholds and duplicate records';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    const rules = await AnomalyRulesService.getRules();

    const outliers = this.findOutliers(transactions, rules.maxTransactionAmount);
    const duplicateGroups = this.findDuplicateGroups(transactions);
    const flagged = this.findFlagged(transactions, rules.flaggedStatuses);

    const anomalousIds = new Set<string>();
    outliers.forEach((t) => anomalousIds.add(t.id));
    duplicateGroups.forEach((group) => group.forEach((t) => anomalousIds.add(t.id)));
    flagged.forEach((t) => anomalousIds.add(t.id));

    const totalFlaggedValue = Array.from(anomalousIds).reduce((sum, id) => {
      const t = transactions.find((tx) => tx.id === id);
      return sum + (t ? Math.abs(t.amount) : 0);
    }, 0);

    const anomalyRate =
      transactions.length === 0
        ? 0
        : (anomalousIds.size / transactions.length) * 100;

    return this.buildReport({
      outliers,
      duplicateGroups,
      flagged,
      totalTransactions: transactions.length,
      anomalousCount: anomalousIds.size,
      anomalyRate,
      totalFlaggedValue,
      maxTransactionAmount: rules.maxTransactionAmount,
    });
  }

  private findOutliers(
    transactions: Transaction[],
    maxTransactionAmount: number,
  ): Transaction[] {
    return transactions.filter(
      (t) => Math.abs(t.amount) > maxTransactionAmount,
    );
  }

  private findDuplicateGroups(transactions: Transaction[]): Transaction[][] {
    const groups = new Map<string, Transaction[]>();

    for (const t of transactions) {
      const key = `${t.date}|${t.category}|${t.description}|${t.amount}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(t);
    }

    return Array.from(groups.values()).filter((group) => group.length > 1);
  }

  private findFlagged(
    transactions: Transaction[],
    flaggedStatuses: Transaction['status'][],
  ): Transaction[] {
    return transactions.filter((t) => flaggedStatuses.includes(t.status));
  }

  private buildReport(data: {
    outliers: Transaction[];
    duplicateGroups: Transaction[][];
    flagged: Transaction[];
    totalTransactions: number;
    anomalousCount: number;
    anomalyRate: number;
    totalFlaggedValue: number;
    maxTransactionAmount: number;
  }): string {
    const lines: string[] = [];

    lines.push('=== Anomaly & Duplicate Audit Report ===');
    lines.push('');

    lines.push(
      `Outlier Transactions (exceeding $${data.maxTransactionAmount.toFixed(2)}):`,
    );
    if (data.outliers.length === 0) {
      lines.push('  None found.');
    } else {
      for (const t of data.outliers) {
        lines.push(
          `  - [${t.id}] ${t.date} | ${t.category} | ${t.description} | $${t.amount.toFixed(2)} (Outlier)`,
        );
      }
    }
    lines.push('');

    lines.push('Duplicate Transaction Sets:');
    if (data.duplicateGroups.length === 0) {
      lines.push('  None found.');
    } else {
      data.duplicateGroups.forEach((group, index) => {
        const sample = group[0];
        lines.push(
          `  Set ${index + 1}: date=${sample.date}, category=${sample.category}, description=${sample.description}, amount=$${sample.amount.toFixed(2)}`,
        );
        for (const t of group) {
          lines.push(`    - ID ${t.id}`);
        }
      });
    }
    lines.push('');

    lines.push('Flagged Status Transactions:');
    if (data.flagged.length === 0) {
      lines.push('  None found.');
    } else {
      for (const t of data.flagged) {
        lines.push(
          `  - [${t.id}] ${t.date} | ${t.category} | ${t.description} | $${t.amount.toFixed(2)} (status: ${t.status})`,
        );
      }
    }
    lines.push('');

    lines.push('Summary:');
    lines.push(`  Total Transactions: ${data.totalTransactions}`);
    lines.push(`  Total Anomalous Transactions: ${data.anomalousCount}`);
    lines.push(`  Anomaly Rate: ${data.anomalyRate.toFixed(2)}%`);
    lines.push(`  Total Flagged Value: $${data.totalFlaggedValue.toFixed(2)}`);

    return lines.join('\n');
  }
}