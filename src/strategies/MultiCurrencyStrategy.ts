import { Transaction } from '../models.js';
import { ExchangeRateService } from '../services/ExchangeRateService.js';
import { AuditStrategy } from './AuditStrategy.js';

//Pull test
export class MultiCurrencyStrategy implements AuditStrategy {
  public readonly name = 'Multi-Currency Auditor';
  public readonly description =
    'Converts and aggregates transactions in a foreign currency';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 5 - Implement this strategy.
    // 1. Call ExchangeRateService.getExchangeRates() asynchronously.
    const exchangeRates = await ExchangeRateService.getExchangeRates();
    
    // 2. Identify the target currency from `customParam` (default to 'EUR' if invalid/not provided).
    let targetCurrency = customParam?.toUpperCase() ?? 'EUR';
    if (!(targetCurrency in exchangeRates.rates)){
      targetCurrency = 'EUR';
    }

    // 3. Look up the exchange rate for the target currency (throw an error if not found in rates).
    
    const targetRate = exchangeRates.rates[targetCurrency];
    if (targetRate == undefined){
      throw new Error("404 Transaction Rate not Found");
    }
    
    // 4. Convert all transaction amounts to the target currency.
    
    //USD transaction Loop
    let totalIncomeUSD = 0;
    let totalExpensesUSD = 0;
    let netBalanceUSD = 0;
    let averageUSD = 0;

    let transactionList = '';

    for (const transaction of transactions){
      const convertedAmount = transaction.amount * targetRate;

      if (transaction.amount > 0) {
        totalIncomeUSD += transaction.amount;
      } else if (transaction.amount < 0){
        totalExpensesUSD += transaction.amount;
      }

      netBalanceUSD += transaction.amount;

      transactionList +=
        `${transaction.id} | ` +
        `${transaction.description} | ` +
        `$${transaction.amount.toFixed(2)} USD -> ` +
        `${convertedAmount.toFixed(2)} ${targetCurrency}\n`;
    }

    if (transactions.length > 0){
      averageUSD = netBalanceUSD / transactions.length;
    }
    
    // 5. Calculate total income, total expenses, and net balance in BOTH USD and target currency.
    // Target Transaction Conversions
    const totalIncomeConverted = (totalIncomeUSD * targetRate).toFixed(2);
    const totalExpensesConverted = (totalExpensesUSD * targetRate).toFixed(2);
    const netBalanceConverted = (netBalanceUSD * targetRate).toFixed(2);
    const averageConverted = (averageUSD * targetRate).toFixed(2);

    
    // 6. Format and return a text-based audit report detailing conversion metrics, conversion rate used, and transaction summaries in both currencies.
    const report = 
      `Multi-Currency Audit Report\n` +
      `Target Currency: ${targetCurrency}\n` +
      `Conversion Rate: ${targetRate}\n\n` +
      
      `Aggregated Metrics:\n` +
      `Income: $${totalIncomeUSD} USD | ${totalIncomeConverted} ${targetCurrency}\n\n` +

      `Expenses: $${totalExpensesUSD} USD | ${totalExpensesConverted} ${targetCurrency}\n\n` +

      `Net Balance: $${netBalanceUSD} USD | ${netBalanceConverted} ${targetCurrency}\n\n` +

      `Average Transaction: $${averageUSD} USD | ${averageConverted} ${targetCurrency}\n\n` +

      `Tranactions:\n` +
      transactionList;
    
    return report;
  
  }
}
