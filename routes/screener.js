const express = require("express");
const cheerio = require("cheerio");
const router = express.Router();
const Screener = require('../models/screener_model');
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const got = require('got');
var mcache = require('memory-cache');
puppeteerExtra.use(pluginStealth());

var cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if (cachedBody) {
            res.send(cachedBody)
            return
        } else {
            res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}

//DEBUG-CODE
// router.get('/debug', async (req, res) => {
//     const browser = await puppeteer.launch({
//         ignoreHTTPSErrors: true,
//         headless: true,
//         args: [
//             "--no-sandbox",
//             // "--proxy-server=http://89.109.7.67:443"
//         ]
//     });
//     const page = await browser.newPage();

//     page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36');

//     await page.goto(`https://www.insiderscreener.com/en/explore?page=2&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`);
//     const html = await page.content();
//     const $ = cheerio.load(html);
//     $('#transactions > div > div > div.table-responsive-md > table > tbody > tr').each((index, el) => {
//         const insiderName = $(el).find("td:nth-child(6) > p:nth-child(1)").text().trim();
//         const tradePrice = $(el).find("td:nth-child(9)").text().trim();
//         const tradeType = $(el)
//             .find("td:nth-child(5) > span > span.d-none.d-sm-block")
//             .text()
//             .trim();
//         const percentage = $(el).find("td:nth-child(8) > span > i > b").text().trim();
//         const shares = percentage != 0 ? $(el).find("td:nth-child(8)").text().replace(/[\n\t\r]/g, " ")
//             .split(percentage)[0].trim() : $(el).find("td:nth-child(8)").text().replace(/[\n\t\r]/g, " ")
//                 .trim();
//         const quantityshares = tradeType === "Purchase" || tradeType === "Planned purchase" ? `+${shares}` : `-${shares}`;
//         const value = $(el)
//             .find(
//                 "td.font-weight-bold.align-middle.text-right.d-none.d-sm-table-cell > span"
//             )
//             .text().replace(/[\n\t\r]/g, " ")
//             .trim();
//         const price = tradeType === "Purchase" || tradeType === "Planned purchase" ? `+${value}` : `-${value}`;
//         const currencyCode = value.split(" ")[1]
//         res.json({
//             name: insiderName,
//             tradePrice: tradePrice,
//             shares: quantityshares,
//             // quantityshares: quantityshares,
//             percentage: percentage,
//             price: price,
//             cc: currencyCode,
//         })
//     })
// })

async function scrapeInsider(param) {
    const browser = await puppeteerExtra.launch({
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--disable-extensions'],
        headless: true,
        args: [
            "--no-sandbox",
            // "--proxy-server=http://89.109.7.67:443",
            "--disable-gpu",
        ]
    });
    const page = await browser.newPage();

    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');
    await page.goto(`https://www.insiderscreener.com/en/explore?page=${param}&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&i_group=501030&i_group=502010&i_group=501020&i_group=503010&i_group=501010&i_group=533020&i_group=533010&i_group=534030&i_group=532020&i_group=532050&i_group=531010&i_group=534020&i_group=532030&i_group=532040&i_group=522030&i_group=522010&i_group=521020&i_group=521010&i_group=524050&i_group=524070&i_group=523010&i_group=524060&i_group=522020&i_group=511010&i_group=513010&i_group=512020&i_group=512010&i_group=513020&i_group=554030&i_group=553010&i_group=551010&i_group=551020&i_group=555010&i_group=554020&i_group=556010&i_group=542010&i_group=541020&i_group=543010&i_group=541010&i_group=562010&i_group=562020&i_group=561020&i_group=561010&i_group=572010&i_group=571060&i_group=571040&i_group=571020&i_group=571010&i_group=571050&i_group=581010&i_group=591010&i_group=591040&i_group=591030&i_group=591020&b_sector=5010&b_sector=5020&b_sector=5030&b_sector=5330&b_sector=5340&b_sector=5320&b_sector=5310&b_sector=5220&b_sector=5210&b_sector=5240&b_sector=5230&b_sector=5110&b_sector=5130&b_sector=5120&b_sector=5540&b_sector=5530&b_sector=5510&b_sector=5550&b_sector=5560&b_sector=5420&b_sector=5410&b_sector=5430&b_sector=5620&b_sector=5610&b_sector=5720&b_sector=5710&b_sector=5810&b_sector=5910&e_sector=50&e_sector=53&e_sector=52&e_sector=51&e_sector=55&e_sector=54&e_sector=56&e_sector=57&e_sector=58&e_sector=59&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`);
    const html = await page.content();
    const $ = cheerio.load(html);
    $('#transactions > div > div > div.table-responsive-md > table > tbody > tr').each((index, el) => {
        const notificationDate = $(el).find("td:nth-child(2)").text().trim();
        const transactionDate = $(el).find("td:nth-child(3)").text().trim();
        const companyName = $(el)
            .find("td:nth-child(4) > div > a:nth-child(1)")
            .text()
            .trim();
        const ticker = $(el).find("td:nth-child(4) > div > span").text().replace("(", " ").replace(")", " ").trim();
        const companyType = $(el).find("td:nth-child(4) > small").text().trim();
        const insiderName = $(el).find("td:nth-child(6) > p:nth-child(1)").text().trim();
        const insiderTitle = $(el).find("td:nth-child(6) > span").text().trim();
        const tradeType = $(el)
            .find("td:nth-child(5) > span > span.d-none.d-sm-block")
            .text()
            .trim();
        const tradePrice = $(el).find("td:nth-child(9)").text().trim();
        const percentage = $(el).find("td:nth-child(8) > span > i > b").text().trim();
        const shares = percentage != 0 ? $(el).find("td:nth-child(8)").text().replace(/[\n\t\r]/g, " ")
            .split(percentage)[0].trim() : $(el).find("td:nth-child(8)").text().replace(/[\n\t\r]/g, " ")
                .trim();
        const quantityshares = tradeType === "Purchase" || tradeType === "Planned purchase" ? `+${shares}` : `-${shares}`;
        const value = $(el)
            .find(
                "td.font-weight-bold.align-middle.text-right.d-none.d-sm-table-cell > span"
            )
            .text().replace(/[\n\t\r]/g, " ")
            .trim();
        const price = tradeType === "Purchase" || tradeType === "Planned purchase" ? `+${value}` : `-${value}`;
        const currencyCode = value.split(" ")[1];
        const countryCode = $(el).find("td:nth-child(1) > img").attr("alt");
        const countryImage = $(el).find("td:nth-child(1) > img").attr("src");
        const companyLink = $(el)
            .find("td:nth-child(4) > div > a:nth-child(1)")
            .attr("href");
        const screener = new Screener({
            NotificationDate: notificationDate,
            TransactionDate: transactionDate,
            CountryCode: countryCode,
            Ticker: ticker,
            CompanyType: companyType,
            CompanyName: companyName,
            InsiderName: insiderName,
            InsiderTitle: insiderTitle,
            TradeType: tradeType,
            Price: tradePrice,
            QuantityShares: quantityshares,
            Percentage: percentage,
            Value: price,
            CurrencyCode: currencyCode,
            url: {
                CompanyLink: `https://www.insiderscreener.com${companyLink}`,
                CountryImage: countryImage,
            }
        });
        screener.save();
    });
    await browser.close();
}

async function main(query) {
    try {
        await scrapeInsider(query);
        console.log(`scrapped page ${query}`);
    } catch (e) {
        console.log(e);
    }
}

router.get('/screener/:id', async (req, res) => {
    const query = req.params.id;
    try {
        await main(query);
        res.send({
            "status": "done",
            "description": `scrapped page ${query}`,
        });
    }
    catch (err) {
        res.send({
            "status": "error",
            "error": err.message,
        });
    }
});

// GET All insider
router.get('/data', cache(300), async (req, res) => {
    try {
        const countryQuery = req.query;
        const limit = req.query.limit ? parseInt(req.query.limit) : 75;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const count = await Screener.countDocuments();
        const result = await Screener.find({ CountryCode: countryQuery.country }, "-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ NotificationDate: -1, TransactionDate: -1 });
        res.status(200).json({
            query: countryQuery,
            serverTime: Date.now(),
            length: count,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            perPage: limit,
            totalPages: parseInt((count / limit).toFixed()),
            isNextPageExist: (page + 1) <= (count / limit) ? true : false,
            isLastPageExist: (page - 1) == 0 ? false : true,
            result: result,
        });
    }
    catch (e) {
        res.send({
            status: 400,
            error: e.message,
        });
    }
})

// InsiderName Individual
router.get('/data/:insiderName', async (req, res) => {
    try {
        const result = await Screener.find({ InsiderName: req.params.insiderName }, "-__v");
        res.status(200).json({ serverTime: Date.now(), total: result.length, result });
    }
    catch (err) {
        res.send({
            status: 400,
            error: e.message,
        });
    }
})

// Company Data
router.get('/company/:companyName', async (req, res) => {
    try {
        const result = await Screener.find({ CompanyName: req.params.companyName }, "-__v");
        res.status(200).json({ serverTime: Date.now(), total: result.length, result });
    }
    catch (err) {
        res.send({
            status: 400,
            error: e.message,
        });
    }
})


//Timer
async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve, miliseconds));
}

//Clean and get new data
async function newData() {
    await Screener.collection.drop().then(async () => {
        got('https://screenerapi.herokuapp.com/screener/1').then(async () => {
            await sleep(20000);
            got('https://screenerapi.herokuapp.com/screener/2').then(async () => {
                await sleep(30000);
                got('https://screenerapi.herokuapp.com/screener/3').then(async () => {
                    await sleep(40000);
                    got('https://screenerapi.herokuapp.com/screener/4').then(async () => {
                        await sleep(50000);
                        got('https://screenerapi.herokuapp.com/screener/5').then(async () => {
                            await sleep(60000);
                            got('https://screenerapi.herokuapp.com/screener/6').then(async () => {
                                await sleep(70000);
                                got('https://screenerapi.herokuapp.com/screener/7').then(async () => {
                                    await sleep(80000);
                                    got('https://screenerapi.herokuapp.com/screener/8').then(async () => {
                                        await sleep(90000);
                                        got('https://screenerapi.herokuapp.com/screener/9').then(async () => {
                                            await sleep(100000);
                                            got('https://screenerapi.herokuapp.com/screener/10').then(async () => {
                                                await sleep(100000);
                                                got('https://screenerapi.herokuapp.com/screener/11').then(async () => {
                                                    await sleep(100000);
                                                    got('https://screenerapi.herokuapp.com/screener/12').then(async () => {
                                                        await sleep(100000);
                                                        got('https://screenerapi.herokuapp.com/screener/13').then(async () => {
                                                            await sleep(100000);
                                                            got('https://screenerapi.herokuapp.com/screener/14').then(async () => {
                                                                await sleep(100000);
                                                                got('https://screenerapi.herokuapp.com/screener/15').then(async () => {
                                                                    await sleep(100000);
                                                                    got('https://screenerapi.herokuapp.com/screener/16').then(async () => {
                                                                        await sleep(100000);
                                                                        got('https://screenerapi.herokuapp.com/screener/17').then(async () => {
                                                                            await sleep(100000);
                                                                            got('https://screenerapi.herokuapp.com/screener/18').then(async () => {
                                                                                await sleep(100000);
                                                                                got('https://screenerapi.herokuapp.com/screener/19').then(async () => {
                                                                                    await sleep(100000);
                                                                                    got('https://screenerapi.herokuapp.com/screener/20');
                                                                                });
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

router.get('/newData', async (req, res) => {
    try {
        await newData();
        res.send({
            status: 200,
            error: 'Processing',
        });
    }
    catch (e) {
        res.send({
            status: 400,
            error: 'Cannot fetch new data, please try again later',
        });
    }
})

module.exports = router;