const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const router = express.Router();


const state = [];

router.get("/screener/:id", async (req, res) => {
    try {
        const query = req.params.id;
        const response = await axios.get(
            `https://www.insiderscreener.com/en/explore?page=${query}&nb_shares=1&sort_by=transaction_date&sort_order=descending&regulator=US&regulator=FR&regulator=DE&regulator=CH&regulator=BE&regulator=ES&regulator=NL&regulator=SE&regulator=IT&regulator=GR&regulator=IN&transaction_type=BUY&transaction_type=SELL&transaction_type=PLANNED_PURCHASE&transaction_type=PLANNED_SALE&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`, {
            headers: {
                "accept-language": "en-US,en;q=0.9,kn;q=0.8",
                "sec-fetch-site": "same-origin",
                "user-agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
                "x-requested-with": "XMLHttpRequest",
            },
        });
        const $ = cheerio.load(response.data);
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
