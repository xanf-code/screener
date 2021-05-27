const express = require("express");
const cheerio = require("cheerio");
const router = express.Router();
const got = require('got');

const state = [];

router.get("/screener/:id", async (req, res) => {
    try {
        const query = req.params.id;
        const response = await got(
            `https://www.insiderscreener.com/en/explore?page=${query}&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en-IN;q=0.9,en-UM;q=0.8,en;q=0.7",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
            },
            "referrer": `https://www.insiderscreener.com/en/explore?page=${query}&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`,
            "referrerPolicy": "same-origin",
            "method": "GET",
            "mode": "cors"
        });
        const $ = cheerio.load(response.body);
        const scrapedData = [];
        const elemSelector = "#transactions > div > div > div.table-responsive-md > table > tbody > tr";
        $(elemSelector).each((index, el) => {
            const notificationDate = $(el).find("td:nth-child(2)").text().trim();
            const transactionDate = $(el).find("td:nth-child(3)").text().trim();
            const companyName = $(el)
                .find("td:nth-child(4) > div > a:nth-child(1)")
                .text()
                .trim();
            const ticker = $(el).find("td:nth-child(4) > div > span").text().trim();
            const companyType = $(el).find("td:nth-child(4) > small").text().trim();
            const insiderName = $(el).find("td:nth-child(6) > p").text().trim();
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

            const data = { notificationDate, transactionDate, companyName, ticker, companyLink, companyType, insiderName, insiderTitle, tradeType, tradePrice, quantityshares, percentage, value, countryCode, countryImage };

            return scrapedData.push(data);
        });
        res.send({
            page: parseInt(query),
            totalPage: 100,
            nextPage: parseInt(query) + 1,
            lastPage: parseInt(query) - 1,
            perPage: state.length,
            status: 200,
            results: scrapedData,
        });

    } catch (e) {
        res.send({
            status: 400,
            error: e,
        });
    }
});

module.exports = router;
