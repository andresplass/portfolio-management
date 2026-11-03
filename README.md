# Portfolio Management

A simple portfolio rebalancing module in TypeScript because i am used to at my current job :)

## Overview

- **`Stock`** with `currentPrice()` method as requested.
- **`Portfolio`**: holds the current stocks (`CurrentStocks[]`), the target
  allocation (`AllocatedStocks[]`), and a `rebalance()` method that compares
  the two and returns the trades (BUY/SELL) needed to match the target.
  I made some other methods if you want to add more stocks and it does not break
  the calculations.
  - Trades whose value doesn't exceed `TRANSACTION_COST` are skipped — not
    worth paying the fee for a correction that small.

## Project structure
Everything is in /src folder.
- `stock.ts` — the `Stock` class.
- `types.ts` — shared types (`AllocatedStocks`, `CurrentStocks`, `RebalanceAction`, ...).
- `portfolio.ts` — the `Portfolio` class and the rebalance logic.
- `script.ts` — a runnable example: builds a portfolio targeting 40% META / 60% AAPL,
  adds some starting (unbalanced) holdings, and prints the rebalance result.

## Disclaimer
In `Conversación: Portfolio Rebalance` i added my conversation with Claude about portofolio rebalances because i didn't know how it worked. I based my code of the rebalance method on that output :)

## How to run it

```bash
npm install
npm run script-portfolio
```
