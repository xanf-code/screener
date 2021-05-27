const express = require("express");
const cheerio = require("cheerio");
const router = express.Router();
const got = require('got');

const state = [];

router.get("/screener", async (req, res) => {
    try {
        const query = req.params.id;
        const response = await got(
            `https://www.insiderscreener.com/en/explore?page=1&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`, {
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
            "referrer": `https://www.insiderscreener.com/en/explore?page=1&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`,
            "referrerPolicy": "same-origin",
            "method": "GET",
            "mode": "cors"
        });
        const $ = cheerio.load(response.body);
        $(
            "#transactions > div > div > div.table-responsive-md > table > tbody > tr"
        ).each((index, el) => {
            state[index] = {};
            state[index]['notificationDate'] = $(el).find("td:nth-child(2)").text().trim();
            state[index]['transactionDate'] = $(el).find("td:nth-child(3)").text().trim();
            state[index]['companyName'] = $(el)
                .find("td:nth-child(4) > div > a:nth-child(1)")
                .text()
                .trim();
            state[index]['ticker'] = $(el).find("td:nth-child(4) > div > span").text().trim();
            state[index]['companyType'] = $(el).find("td:nth-child(4) > small").text().trim();
            state[index]['insiderName'] = $(el).find("td:nth-child(6) > p").text().trim();
            state[index]['insiderTitle'] = $(el).find("td:nth-child(6) > span").text().trim();
            state[index]['tradeType'] = $(el)
                .find("td:nth-child(5) > span > span.d-none.d-sm-block")
                .text()
                .trim();
            state[index]['tradePrice'] = $(el).find("td:nth-child(9)").text().trim();
            state[index]['quantityshares'] = $(el).find("td:nth-child(8)").text().trim();
            state[index]['percentage'] = $(el).find("td:nth-child(8) > span > i > b").text().trim();
            state[index]['value'] = $(el)
                .find(
                    "td.font-weight-bold.align-middle.text-right.d-none.d-sm-table-cell > span"
                )
                .text().replace(/[\n\t\r]/g, " ")
                .trim();
            state[index]['countryCode'] = $(el).find("td:nth-child(1) > img").attr("alt");
            state[index]['countryImage'] = $(el).find("td:nth-child(1) > img").attr("src");
            state[index]['companyLink'] = $(el)
                .find("td:nth-child(4) > div > a:nth-child(1)")
                .attr("href");
        });
        res.send({
            page: parseInt(query),
            totalPage: 100,
            nextPage: parseInt(query) + 1,
            lastPage: parseInt(query) - 1,
            perPage: state.length,
            status: 200,
            results: state,
        });
    } catch (e) {
        res.send({
            status: 400,
            error: e,
        });
    }
});

module.exports = router;
