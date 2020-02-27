var mongoose = require('mongoose')

var tradeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    symbol: String,
    price: mongoose.Schema.Types.Decimal128,
    quantity: Number,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Trade', tradeSchema)