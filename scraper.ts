import { CustomProduct } from './classes/custom-product'
import { IkeaCategory } from './classes/ikea-category'
import { IkeaCategoryProducts } from './classes/ikea-category-products'
import { IkeaProduct } from './classes/ikea-product'

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

    return new Promise(function(resolve, reject) {
        rp(url)
        .then(function (html: any) {
            let categories = $('ul.range-catalog-list__list', html).children();

            // console.log(categories.length);

            let parsedCategories: string[] = [];

            categories.each((index: number, element: any) => {
                parsedCategories.push($(element).children('a').attr('href'));
            })
            
            resolve(parsedCategories);
        })
        .catch(function (err: any) {
            //handle error
        });
    })
}

function getFromAPI(id: string, offset: number, max?: number) {
    const sessionKey = "5286cc02-fda8-486d-3edd-768c6fb5d143"
    const customerKey = "f88074fb-1d2b-40d2-38b3-b6cf1bf06b1a"

    const first = offset;
    let last = offset + 24;
    if(max !== undefined){
        last = last < max ? last: max;
    }

    const arg: any = {};
    arg.market = 'CAEN';
    // arg.selected_category = ('category_catalog_caen:\'10475\'');
    arg.selected_category = ('category_catalog_caen:\''+ id + '\'');
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
            let aps:CustomProduct[] = [];
                    
            validResults.forEach(function (a, index) {
                let po: any = $(a)
    
                let ap: CustomProduct = new CustomProduct(
                    $('img',po).attr('src'),
                    $('span.product-compact__name', po).text(),
                    $('span.product-compact__type', po).text(),
                    $('span.product-compact__description', po).text(),
                    $('span.product-compact__price__value', po).text()
                )

                aps.push(ap);
            })
                

            let temptxt = fs.readFileSync( './dump/' + id + '.txt','utf8')

            let origJsonData = [];
            if(temptxt){
                origJsonData = JSON.parse(temptxt);
            }

            aps = origJsonData.concat(aps);

            let jsondata = JSON.stringify(aps);


            fs.writeFile( './dump/' + id + ".txt", jsondata, (err: any) => {
                getFromAPI(id, last + 1, catProd.productCount[0].count);
        
                if (err) console.log(err);
                // console.log("Successfully Written to File.");
            });
        }

    })
}

function init(){
    // getKallax();

    
    http.createServer(function (req:any, res:any) {

        var baseURL = 'http://' + req.headers.host + '/';
        // var myURL = new URL(req.url, baseURL);

        const method = req.method;
        const current_url = new URL(req.url, baseURL);
        const pathname = current_url.pathname;
        const search_params = current_url.searchParams;

        if(method === 'GET' && pathname === '/categories' && !search_params.has('id')) {
            let promise = getAllCategories();

            promise.then(function(categories){
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(categories));
            })
        }
        else if(method === 'GET' && pathname === '/categories' && search_params.has('id')) {
            // GET request to /posts?id=123
            let text = fs.readFileSync( './dump/' + search_params.get('id'), 'utf8')
            const storedData = JSON.parse(text);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(storedData));
        }
        // else if(method === 'POST' && pathname === '/posts') {
        //     // POST request to /posts
        // } 
        else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({}));
        }
    }).listen(8080);

    if (!fs.existsSync('./dump')){
        fs.mkdirSync('./dump');
    }

    getAllCategories().then(function(categories){
        let categoryIDs:string[] = [];

        (categories as string[]).forEach((cat: string) => {
            categoryIDs.push(cat.substring(cat.length - 6, cat.length-1));
        });
        categoryIDs.forEach(function(id){
            let fileCheck = fs.existsSync('./dump/' + id+ '.txt');
            if(!fileCheck){
                console.log('./dump/' + id+ '.txt does not exists, fetching...');
                fs.writeFile( './dump/' + id+ '.txt','', (err: any) => {
                    getFromAPI(id, 1, undefined);
                });    
            } else {
                console.log('./dump/' + id+ '.txt exists');
            }
        })

    })
}

init();

