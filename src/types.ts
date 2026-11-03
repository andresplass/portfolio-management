import { Stock } from "./stock";

export type AllocatedStocks = {
    stock: Stock;
    weight: number;
}

export type CurrentStocks ={
    stock: Stock;
    amount: number;
};

export type PortfolioData = {
    allocatedStocks: AllocatedStocks[];
    currentStocks: CurrentStocks[];
};

export type RebalanceActionType = 'BUY' | 'SELL';

export type RebalanceAction = {
    stockName: string;
    action: RebalanceActionType;
    amount: number;
    amountValue: number;
    transactionCost: number;
}