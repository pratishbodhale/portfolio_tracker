var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const { check, oneOf, param, validationResult } = require('express-validator');

var Trade = require("../models/trade");
var Portfolio = require("../models/portfolio");

const Symbol = "symbol", Price = "price", Quantity = "quantity";

// Adds a trade
router.post('/', [
  check(Symbol).isAlpha(),
  check(Price).isDecimal(),
  check(Quantity).isNumeric()
], function(req, res, next) {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if(req.body.price < 0){
    return res.status(500).json({ error: "Buy price cannot be negative" });
  }

  const trade = new Trade({
    _id: new mongoose.Types.ObjectId(),
    symbol: req.body.symbol,
    price: req.body.price,
    quantity: req.body.quantity
  });

  trade
    .save()
    .then(result => {
      console.log(result);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });

  // Checks if portfolio is already created for that stocks symbol
  Portfolio.find({symbol: trade.symbol}).exec()
  .then(docs => {
    console.log(docs);

    // If portfolio doesn't exist then create new portfolio
    if(docs.length == 0){
         portfolio = new Portfolio({
          _id: new mongoose.Types.ObjectId(),
          symbol: trade.symbol,
          avg_price: trade.price,
          quantity: trade.quantity
        });
        portfolio.tradeIds.push(trade);
        portfolio.save()
        .then(result => {
          console.log(result);
          return res.status(200).json({message: "Added trade with unique id: "+trade._id+" Also created portfolio for Symbol: "+trade.symbol, 
                                      trade: trade, 
                                      portfolio: portfolio});
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });

    }
    // If portfolio exists then update its average buy price and quantity
    else if(docs.length == 1){
      var portfolio = docs[0];
      var old_avg_price = portfolio.avg_price;
      var old_qty = portfolio.quantity;
      portfolio.avg_price = (old_avg_price*old_qty + trade.quantity*trade.price)/(old_qty+trade.quantity);
      portfolio.quantity = (old_qty+trade.quantity);
      portfolio.tradeIds.push(trade);
      portfolio.save();

      return res.status(200).json({message: "Added trade with unique id: "+trade._id+" Also updated portfolio for Symbol: "+trade.symbol, 
                            trade: trade, 
                            portfolio: portfolio});

    }else{
      res.status(500).json({
        error: "More than one protfolio found for the same symbol"
      });
    }
  })
  .catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err
    });
  });
});

// This route gets executed when hit delete type of request with parameter trade id
// It deletes corresponding trade and updates portfolio accordingly
router.delete('/:tradeId',oneOf([
  param('tradeId').exists()
]), function(req, res, next) {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const id = req.params.tradeId;
  Trade.findOneAndRemove({_id: id}).exec()
  .then(trade => {
    console.log(trade);
    symbol = trade.symbol;
    
    Portfolio.find({symbol: trade.symbol}).exec()
    .then(docs => {
      console.log(docs);
      if(docs.length == 1){
          portfolio = docs[0];
          portfolio.tradeIds.pull(trade._id);

          // If not trades are remaining then delete the portfolio for that symbol
          if(!portfolio.tradeIds.length){
           Portfolio.deleteOne({_id: portfolio._id}).exec().then(result => {
              console.log(result);
              return res.status(200).json({
                message: "Deleted trade with id: "+id+" & Deleted portfolio for Symbol: "+trade.symbol
              });
            }).catch( err => {
              console.log(err);
              return res.status(500).json({
                error: err,
              });
            });
          }
          else{
            portfolio.avg_price = (portfolio.avg_price*portfolio.quantity - trade.price*trade.quantity)/(portfolio.quantity-trade.quantity);
            portfolio.quantity = portfolio.quantity-trade.quantity;
            portfolio.save()
            .then(result => {
              console.log(result);
              return res.status(200).json({
                  message: "Deleted trade with id: "+id+" & Updated portfolio for Symbol: "+trade.symbol
                });
            })
            .catch(err => {
              console.log(err);
              return res.status(500).json({
                error: err
              });
            });
          }

      }else{
        console.log( "More/less than one protfolio found for the same symbol");
        return res.status(500).json({
          error: "More/less than one protfolio found for the same symbol"
        });
      }

    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });

  })

  .catch(err => {
    console.log(err);
    return res.status(500).json({
      message: "Unable to find trade with given id",
      error: err
    });
  });

});

module.exports = router;
