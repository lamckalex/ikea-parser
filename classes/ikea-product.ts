
export class IkeaProduct {
    id: string;
    product_key: string;
    rank: string;
    relevance: string;

    constructor(id: string, product_key: string, rank: string, relevance: string) {
        this.id = id;
        this.product_key = product_key;
        this.rank = rank;
        this.relevance = relevance;
    }
}