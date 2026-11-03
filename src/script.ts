// You’re building a portfolio management module, part of a personal investments and trading app

// Construct a simple Portfolio class that has a collection of Stocks. 
// Assume each Stock has a “Current Price” method that receives the last available price. 
// Also, the Portfolio class has a collection of “allocated” Stocks that represents the 
// distribution of the Stocks the Portfolio is aiming (i.e. 40% META, 60% APPL)

// Provide a portfolio rebalance method to know which Stocks should be sold and 
// which ones should be bought to have a balanced Portfolio based on the portfolio’s allocation.

// Add documentation/comments to understand your thinking process and solution

// Important: If you use LLMs that’s ok, but you must share the conversations.

import { Stock } from './stock';
import { Portfolio } from './portfolio';

const meta = new Stock('META', 600000);
const aapl = new Stock('AAPL', 330000);

const portfolio = new Portfolio([
    { stock: meta, weight: 0.4 },
    { stock: aapl, weight: 0.6 },
  ],
);

portfolio.addStock('META', 20);
portfolio.addStock('AAPL', 5);

for (const { stock, amount } of portfolio.getCurrentStocks()) {
  console.log(`${stock.name}, ${(stock.currentPrice() * amount).toFixed(2)}`);
}
console.log(`Total, ${portfolio.getTotalValue().toFixed(2)}`);

console.log('Rebalance actions:');
for (const action of portfolio.rebalance()) {
  console.log(
    `  ${action.action} ${action.amount.toFixed(4)} ${action.stockName} ` +
      `(~$${action.amountValue.toFixed(2)}, fee $${action.transactionCost.toFixed(2)})`,
  );
}
