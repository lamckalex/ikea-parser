"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var rp = require('request-promise');
var http = require('http');
var $ = require('cheerio');
var fs = require("fs");
function getKallax() {
    var url = 'https://www.ikea.com/ca/en/p/kallax-shelf-unit-white-10409932/';
    rp(url)
        .then(function (html) {
        console.log($('h1.product-pip__product-heading', html).text());
    })
        .catch(function (err) {
        //handle error
    });
}
function getAllCategories() {
    var url = 'https://www.ikea.com/ca/en/cat/all-furniture-fu001/';
    rp(url)
        .then(function (html) {
        var categories = $('ul.range-catalog-list__list', html).children();
        console.log(categories.length);
        categories.each(function (index, element) {
            console.log($(element).children('a').attr('href'));
        });
    })
        .catch(function (err) {
        //handle error
    });
}
var AlexProduct = /** @class */ (function () {
    function AlexProduct(img, name, type, description, price) {
        this.img = img;
        this.name = name;
        this.type = type;
        this.description = description;
        this.price = price;
    }
    return AlexProduct;
}());
var IkeaProduct = /** @class */ (function () {
    function IkeaProduct(id, product_key, rank, relevance) {
        this.id = id;
        this.product_key = product_key;
        this.rank = rank;
        this.relevance = relevance;
    }
    return IkeaProduct;
}());
var IkeaCategoryProducts = /** @class */ (function () {
    function IkeaCategoryProducts(attributes, key, ticket, variants) {
        this.attributes = attributes;
        this.key = key;
        this.ticket = ticket;
        this.variants = variants;
    }
    return IkeaCategoryProducts;
}());
var IkeaCategory = /** @class */ (function () {
    function IkeaCategory(categoryOverview, categoryProducts, facets, productCount) {
        this.categoryOverview = categoryOverview;
        this.categoryProducts = categoryProducts;
        this.facets = facets;
        this.productCount = productCount;
    }
    return IkeaCategory;
}());
function getFromAPI(offset, max) {
    var _this = this;
    var sessionKey = "5286cc02-fda8-486d-3edd-768c6fb5d143";
    var customerKey = "f88074fb-1d2b-40d2-38b3-b6cf1bf06b1a";
    var first = offset;
    var last = offset + 24;
    if (max !== undefined) {
        last = last < max ? last : max;
    }
    var arg = {};
    arg.market = 'CAEN';
    arg.selected_category = ('category_catalog_caen:\'10475\'');
    arg.window_first = offset; //seems to need a min value of 1
    arg.window_last = last;
    arg.sort_by = 'relevance';
    arg.presentation_attributes = "product[id]";
    arg.facets = "";
    arg.filter = "NOT catalog_not_main_product:'true' OR catalog_main_product: 'true'";
    arg.pinned_products = "";
    var url = "https://wab5f62d0.api.esales.apptus.cloud/api/v1/panels/category-products?" +
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
        "&arg.pinned_products=" + arg.pinned_products;
    rp(url).then(function (resp) { return __awaiter(_this, void 0, void 0, function () {
        var catProd, products, promises_1, results, validResults, text, aps_1, temptxt, origJsonData, jsondata;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    catProd = JSON.parse(resp);
                    if (!catProd.categoryProducts) return [3 /*break*/, 2];
                    products = catProd.categoryProducts[0];
                    promises_1 = [];
                    products.products.forEach(function (prod) {
                        var lastThree = prod.attributes.id.substring(prod.attributes.id.length - 3, prod.attributes.id.length);
                        var prodURL = "https://www.ikea.com/ca/en/products/" + lastThree + "/" + prod.attributes.id + "-compact-fragment.html";
                        promises_1.push(rp(prodURL));
                    });
                    return [4 /*yield*/, Promise.all(promises_1.map(function (p) { return p.catch(function (e) { return e; }); }))];
                case 1:
                    results = _a.sent();
                    validResults = results.filter(function (result) { return !(result instanceof Error); });
                    text = '';
                    aps_1 = [];
                    validResults.forEach(function (a, index) {
                        var po = $(a);
                        var ap = new AlexProduct($('img', po).attr('src'), $('span.product-compact__name', po).text(), $('span.product-compact__type', po).text(), $('span.product-compact__description', po).text(), $('span.product-compact__price__value', po).text());
                        aps_1.push(ap);
                    });
                    temptxt = fs.readFileSync('temp.txt', 'utf8');
                    origJsonData = [];
                    if (temptxt) {
                        origJsonData = JSON.parse(temptxt);
                    }
                    aps_1 = origJsonData.concat(aps_1);
                    jsondata = JSON.stringify(aps_1);
                    fs.writeFile("temp.txt", jsondata, function (err) {
                        getFromAPI(last + 1, catProd.productCount[0].count);
                        if (err)
                            console.log(err);
                        console.log("Successfully Written to File.");
                    });
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
}
function init() {
    // getKallax();
    getAllCategories();
    http.createServer(function (req, res) {
        var text = fs.readFileSync('temp.txt', 'utf8');
        // res.writeHead(200, {'Content-Type': 'text/plain'});
        // res.setHeader('Content-Type', 'application/json');
        var storedData = JSON.parse(text);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(storedData));
    }).listen(8080);
    fs.writeFile("temp.txt", '', function (err) {
        getFromAPI(1, undefined);
    });
}
init();
//# sourceMappingURL=scraper.js.map