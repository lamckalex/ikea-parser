export class IkeaCategory {
    categoryOverview: any[];
    categoryProducts: any[];
    facets: any[];
    productCount: any[];

    constructor(categoryOverview: any[], categoryProducts: any[], facets: any[], productCount: any[]) {
        this.categoryOverview = categoryOverview;
        this.categoryProducts = categoryProducts;
        this.facets = facets;
        this.productCount = productCount;
    }
}