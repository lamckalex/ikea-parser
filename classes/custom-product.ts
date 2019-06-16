
export class CustomProduct {
    img: string;
    name: string;
    type: string;
    description: string;
    price: string;

    constructor(img:string, name:string, type:string, description:string, price:string){
        this.img = img;
        this.name = name;
        this.type = type;
        this.description = description;
        this.price = price;
    }
}