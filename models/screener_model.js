
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MapSchema = new Schema({
    CompanyLink: {
        type: String,
    },
    CountryImage: {
        type: String,
    },
})

const Screener = Schema({
    Index: {
        type: Number,
    },
    NotificationDate: {
        type: String,
    },
    TransactionDate: {
        type: String,
    },
    Ticker: {
        type: String,
        default: "Anonymous",
    },
    CompanyType: {
        type: String,
        default: "Anonymous",
    },
    CompanyName: {
        type: String,
        default: "Anonymous",
    },
    InsiderName: {
        type: String,
        default: "Anonymous",
    },
    InsiderTitle: {
        type: String,
        default: "Anonymous",
    },
    TradeType: {
        type: String,
    },
    Price: {
        type: String,
    },
    CountryCode: {
        type: String,
    },
    QuantityShares: {
        type: String,
    },
    Percentage: {
        type: String,
        default: "0%",
    },
    Value: {
        type: String,
    },
    url: {
        type: MapSchema,
        _id: false,
    },
});



module.exports = mongoose.model("Screener", Screener);