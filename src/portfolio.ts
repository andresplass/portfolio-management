import { AllocatedStocks, CurrentStocks, RebalanceAction } from "./types";

// Dejé comentarios en el por qué hice los métodos o constantes (en inglés como si fuera documentación)


// Transaction cost in CLP
const TRANSACTION_COST = 5000

export class Portfolio {
  private currentStocks: CurrentStocks[] = [];
  private allocatedStocks: AllocatedStocks[] = [];

  constructor(allocatedStocks: AllocatedStocks[]) {
    this.setAllocatedStocks(allocatedStocks);
  }

  // We just set the stock if it exists in allocated stocks or if input is valid.
  public addStock(stock: string, amount: number): void {
    if (amount <= 0) {
      throw new Error("Amount of stock must be greater than 0");
    }

    const stockExists = this.currentStocks.find(
      (currentStock) => currentStock.stock.name === stock,
    );

    if (stockExists) {
      stockExists.amount += amount;
      return;
    }

    throw new Error("Stock does not exist in the portfolio");
  }

  // Public and in a separate method because we want to have the capacity to
  // add another stock in the allocated stocks, so we have to validate again.
  // Validations are: the sum has to be 1 and input cannot be empty.
  public setAllocatedStocks(allocatedStocks: AllocatedStocks[]): void {
    const allocatedStockSum = allocatedStocks.reduce(
      (sum, stock) => sum + stock.weight,
      0,
    );

    // Sometimes it can be a floating point number so not always sum is 1.
    // This idea was given by AI after evaluating the code. 
    if (Math.abs(allocatedStockSum - 1) > 1e-6) {
      throw new Error("Allocated stocks must sum 100%");
    }

    if (!allocatedStocks || allocatedStocks.length === 0) {
      throw new Error("Targeted allocated stocks cannot be empty");
    }

    this.allocatedStocks = allocatedStocks;

    for (const allocatedStock of allocatedStocks) {
      const stockExists = this.currentStocks.find(
        (currentStock) => currentStock.stock.name === allocatedStock.stock.name,
      );

      if (!stockExists) {
        this.currentStocks.push({ stock: allocatedStock.stock, amount: 0 });
      }
    }
  }

   getCurrentStocks(): CurrentStocks[] {
    return this.currentStocks;
  }

  getAllocatedStocks(): AllocatedStocks[] {
    return this.allocatedStocks;
  }

  getTotalValue(): number {
    return this.currentStocks.reduce(
      (total, { stock, amount }) => total + stock.currentPrice() * amount,
      0,
    );
  }

  rebalance(): RebalanceAction[] {
    const actions: RebalanceAction[] = [];


    const totalValue = this.getTotalValue();

    // We have to calculate the total value of an existing stock.
    for (const { stock, weight } of this.allocatedStocks) {
        const currentStock = this.currentStocks.find((s) => s.stock.name === stock.name);

        // This "should" not happen, but we have to validate just in case.
        if (!currentStock) {
            throw new Error(`Current stock for ${stock.name} not found`);
        }

        const currentValue = currentStock.amount * stock.currentPrice();
        const targetValue = totalValue * weight;

        // If transaction cost is greater than the difference, we don't want to do anything.
        const difference = targetValue - currentValue;
            if (Math.abs(difference) <= TRANSACTION_COST) continue;

      actions.push({
        stockName: stock.name,
        action: difference > 0 ? 'BUY' : 'SELL',
        amount: Math.abs(difference) / stock.currentPrice(),
        amountValue: Math.abs(difference),
        transactionCost: TRANSACTION_COST,
      });
    }

    return actions;
  }
}
