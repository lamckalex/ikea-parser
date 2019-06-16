import { stringify } from "querystring";

const rp = require('request-promise');
var http = require('http');
const $ = require('cheerio');
const fs = require("fs");


function getKallax() {
    const url = 'https://www.ikea.com/ca/en/p/kallax-shelf-unit-white-10409932/';

    rp(url)
        .then(function (html: any) {
            console.log($('h1.product-pip__product-heading', html).text());
        })
        .catch(function (err: any) {
            //handle error
        });

}

function getAllCategories() {
    const url = 'https://www.ikea.com/ca/en/cat/all-furniture-fu001/';

    rp(url)
        .then(function (html: any) {
            let categories = $('ul.range-catalog-list__list', html).children();

            console.log(categories.length);

            categories.each((index: number, element: any) => {
                console.log($(element).children('a').attr('href'));
            })
        })
        .catch(function (err: any) {
            //handle error
        });
}

class AlexProduct {
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

class IkeaProduct {
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

class IkeaCategoryProducts {

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

class IkeaCategory {
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

function getFromAPI(offset: number, max?: number) {
    const sessionKey = "5286cc02-fda8-486d-3edd-768c6fb5d143"
    const customerKey = "f88074fb-1d2b-40d2-38b3-b6cf1bf06b1a"

    const first = offset;
    let last = offset + 24;
    if(max !== undefined){
        last = last < max ? last: max;
    }

    const arg: any = {};
    arg.market = 'CAEN';
    arg.selected_category = ('category_catalog_caen:\'10475\'');
    arg.window_first = offset; //seems to need a min value of 1
    arg.window_last = last;
    arg.sort_by = 'relevance';
    arg.presentation_attributes = "product[id]";
    arg.facets = "";
    arg.filter = "NOT catalog_not_main_product:'true' OR catalog_main_product: 'true'";
    arg.pinned_products = "";


    const url = "https://wab5f62d0.api.esales.apptus.cloud/api/v1/panels/category-products?" +
        "sessionKey=" + sessionKey +
        "&customerKey=" + customerKey +
        "&market=" + arg.market +
        "&arg.market=" + arg.market +
        "&arg.selected_category=" + arg.selected_category +
        "&arg.window_first=" + arg.window_first +
        "&arg.window_last=" + arg.window_last +
        "&arg.sort_by=" + arg.relevance +
        "&arg.presentation_attributes=" + arg.presentation_attributes +
        "&arg.facets=" + arg.facets +
        "&arg.filter=" + arg.filter +
        "&arg.pinned_products=" + arg.pinned_products


    rp(url).then(async (resp: string) => {
        let catProd: IkeaCategory = JSON.parse(resp);
        // console.log(first, last);
        // console.log('Total items ' + catProd.productCount[0].count)

        if(catProd.categoryProducts){
            let products = catProd.categoryProducts[0];
            let promises: any[] = [];
            products.products.forEach((prod: IkeaCategoryProducts) => {
                let lastThree = prod.attributes.id.substring(prod.attributes.id.length - 3, prod.attributes.id.length);
                let prodURL = "https://www.ikea.com/ca/en/products/" + lastThree + "/" + prod.attributes.id + "-compact-fragment.html";
                promises.push(rp(prodURL))
            });
    
            const results = await Promise.all(promises.map(p => p.catch((e: any) => e)));
            // console.log('unfiltered results length', results.length);
            const validResults = results.filter(result => !(result instanceof Error));
            // console.log('filtered results length', validResults.length);
    
            
            let text = '';
            let aps:AlexProduct[] = [];
                    
            validResults.forEach(function (a, index) {
                let po: any = $(a)
    
                let ap: AlexProduct = new AlexProduct(
                    $('img',po).attr('src'),
                    $('span.product-compact__name', po).text(),
                    $('span.product-compact__type', po).text(),
                    $('span.product-compact__description', po).text(),
                    $('span.product-compact__price__value', po).text()
                )

                aps.push(ap);
            })
                

            let temptxt = fs.readFileSync('temp.txt','utf8')

            let origJsonData = [];
            if(temptxt){
                origJsonData = JSON.parse(temptxt);
            }

            aps = origJsonData.concat(aps);

            let jsondata = JSON.stringify(aps);


            fs.writeFile("temp.txt", jsondata, (err: any) => {
                getFromAPI(last + 1, catProd.productCount[0].count);
        
                if (err) console.log(err);
                console.log("Successfully Written to File.");
            });
        }

    })
}

function init(){
    // getKallax();

    getAllCategories();
    
    http.createServer(function (req:any, res:any) {
    
        let text = fs.readFileSync('temp.txt','utf8')
        
        // res.writeHead(200, {'Content-Type': 'text/plain'});
        // res.setHeader('Content-Type', 'application/json');

        const storedData = JSON.parse(text);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(storedData));
    
    }).listen(8080);

    fs.writeFile("temp.txt",'', (err: any) => {
        getFromAPI(1, undefined);
    });
    
}

init();

