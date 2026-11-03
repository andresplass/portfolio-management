# Portfolio Management

A simple portfolio rebalancing module in TypeScript.

## Overview

- **`Stock`**: a tradable asset with a `currentPrice()` method.
- **`Portfolio`**: holds the current stocks (`CurrentStocks[]`), the target
  allocation (`AllocatedStocks[]`), and a `rebalance()` method that compares
  the two and returns the trades (BUY/SELL) needed to match the target mix.
  - Every stock you can hold must first have a target allocation defined
    (even `0`), so `currentStocks` and `allocatedStocks` always track the
    same set of symbols.
  - Trades whose value doesn't exceed `TRANSACTION_COST` are skipped — not
    worth paying the fee for a correction that small.

## Project structure

- `stock.ts` — the `Stock` class.
- `types.ts` — shared types (`AllocatedStocks`, `CurrentStocks`, `RebalanceAction`, ...).
- `portfolio.ts` — the `Portfolio` class and the rebalance logic.
- `script.ts` — a runnable example: builds a portfolio targeting 40% META / 60% AAPL,
  adds some starting (unbalanced) holdings, and prints the rebalance result.

## Running it

```bash
npm install
npm run script-portfolio
```
