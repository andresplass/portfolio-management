export class Stock {
    constructor (
        public readonly name: string,
        private price: number
    ) {}

    public currentPrice(): number {
        return this.price;
    }

    public updatePrice(newPrice: number): void {
        if (newPrice <= 0) {
            throw new Error("Price must be greater than 0");
        }
        this.price = newPrice;
    }
}