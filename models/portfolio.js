var mongoose = require('mongoose')

var Trade = require("../models/trade");

var portfolioSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    symbol: String,
    avg_price: mongoose.Schema.Types.Decimal128,
    quantity: Number,
    tradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: Trade }]
});

module.exports = mongoose.model('Portfolio', portfolioSchema)