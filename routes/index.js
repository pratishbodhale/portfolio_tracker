var express = require('express');
var router = express.Router();

var Trade = require("../models/trade");
var Portfolio = require("../models/portfolio");

const Symbol = "symbol", Price = "price", Quantity = "quantity", Current_price = 100.00;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to the Portfolio Tracker Application | refer: <a href="https://github.com/pratishbodhale/portfolio_tracker"> https://github.com/pratishbodhale/portfolio_tracker</a> for API documentation');
});

// Returns all the stocks along with all the trades that has been placed corresponding to every stock
router.get('/portfolio/', function(req, res, next) {
  Portfolio.find().populate('tradeIds').exec()
    .then(portfolios => {

      var result = [];
      for(var i=0; i<portfolios.length;i++){
        var portfolio = portfolios[i];
        var resultTrades = [];
        for(var j=0;j<portfolio.tradeIds.length;j++){
          trade = portfolio.tradeIds[j];
          resultTrades.push({id: trade._id, price: trade.price, quantity: trade.quantity});
        }
        result.push({id: portfolio._id, symbol: portfolio.symbol, trades: resultTrades});
      }
      return res.status(200).json({portfolio: result});
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });
});

// Returns all the stock portfolios
// averga buy price, net quantity is returned per stock
router.get('/holdings/', function(req, res, next) {
  Portfolio.find().exec()
    .then(portfolios => {

      var result = [];
      for(var i=0; i<portfolios.length;i++){
        var portfolio = portfolios[i];
        result.push({id: portfolio._id, symbol: portfolio.symbol, avg_buy_price: portfolio.avg_price, quantity: portfolio.quantity});
      }
      return res.status(200).json({holdings: result});
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });
});

// Calculates returns by considering current stock price as 100; Also returns breakdown per stock
router.get('/returns/', function(req, res, next) {
  Portfolio.find().exec()
  .then(portfolios => {

    var result = [];
    var net = 0;
    for(var i=0; i<portfolios.length;i++){
      var portfolio = portfolios[i];
      var return_for_ticker = (Current_price - portfolio.avg_price)*portfolio.quantity;
      net += return_for_ticker;
      result.push({symbol: portfolio.symbol, returns: return_for_ticker});
    }
    return res.status(200).json({net_returns: net, returns_per_ticker: result});
  })
  .catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err
    });
  });
});
module.exports = router;
