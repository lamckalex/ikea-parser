import { IkeaProduct } from './ikea-product'

export class IkeaCategoryProducts {

    attributes: IkeaProduct;
    key: string;
    ticket: string;
    variants: any[];

    constructor(attributes: any, key: string, ticket: string, variants: any[]) {
        this.attributes = attributes;
        this.key = key;
        this.ticket = ticket;
        this.variants = variants;
    }
}