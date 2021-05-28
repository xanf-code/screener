const express = require("express");
const cheerio = require("cheerio");
const router = express.Router();
const got = require('got');
const Screener = require('../models/screener_model');

async function scrapeInsider(param) {
    const response = await got(
        `https://www.insiderscreener.com/en/explore?page=${param}&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en-IN;q=0.9,en-UM;q=0.8,en;q=0.7",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
        },
        "mode": "cors"
    });
    const $ = cheerio.load(response.body);
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
        const quantityshares = $(el).find("td:nth-child(8)").text().trim();
        const percentage = $(el).find("td:nth-child(8) > span > i > b").text().trim();
        const value = $(el)
            .find(
                "td.font-weight-bold.align-middle.text-right.d-none.d-sm-table-cell > span"
            )
            .text().replace(/[\n\t\r]/g, " ")
            .trim();
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
            Value: value,
            url: {
                CompanyLink: companyLink,
                CountryImage: countryImage,
            }
        });
        screener.save();
    });
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
})
//GET All insider
// router.get('/data', async (req, res) => {
//     try {
//         const limit = req.query.limit ? parseInt(req.query.limit) : 75;
//         const page = req.query.page ? parseInt(req.query.page) : 1;
//         const count = await Screener.countDocuments();
//         const result = await Screener.find({}, "-__v")
//             .skip((page - 1) * limit)
//             .limit(limit)
//             .sort({ NotificationDate: -1 });
//         res.status(200).json({
//             serverTime: Date.now(),
//             length: count,
//             currentPage: page,
//             nextPage: page + 1,
//             previousPage: page - 1,
//             perPage: limit,
//             totalPages: parseInt((count / limit).toFixed()),
//             isNextPageExist: (page + 1) <= (count / limit) ? true : false,
//             isLastPageExist: (page - 1) == 0 ? false : true,
//             result: result,
//         });
//     }
//     catch (e) {
//         res.send({
//             status: 400,
//             error: e.message,
//         });
//     }
// })

// //InsiderName Individual
// router.get('/screener/:insiderName', async (req, res) => {
//     try {
//         const result = await Screener.find({ InsiderName: req.params.insiderName }, "-__v");
//         res.status(200).json({ serverTime: Date.now(), total: result.length, result });
//     }
//     catch (err) {
//         res.send({
//             status: 400,
//             error: e.message,
//         });
//     }
// })

module.exports = router;