# Stock portfolio tracker

This is an application is a simulation of trading platform, It is written using web framework expressJs and mongoose as ORM for mongodb. 
Using this application one can place, remove a trade. Here trade is considered as placing an order. Person can place multiple trades with same stock symbol, Portfolio takes care of showing the net state for a stock. In the backend it maintains the user portfolio. So suppose 2 trades are placed for the same trading symbol then portfolio accumulates it and saves net state (average buy price, net quantity) per stock also the pointer to trades participating for that stock.

## To start the application 
```bash
npm install
npm start
```

## Api guide
### Add Trade
Actions performed: 
* Adds trade to trade list
* checks if portfolio exists for that trade symbol
* if yes, update average buy price, quantity & append trade_id to portfolio
* if no, create new portfolio

```json
post /trade
{
	"symbol": "TCS",
	"price": 1027.1,
	"quantity": 1
}
```
### Delete trade
Actions performed: 
* Checks if trade exists, get the trade symbol
* Get the corresponding portfolio and update avg_buy_price, quantity
* If only this trade exists for that portfolio then delete the portfolio, else remove this trade_id from portfolio  
* Delete trade

```json
delete /trade/:trade_id
```

### Check Portfolio
Gets all the stocks with the corresponding trades information 

```json
get /portfolio
```

### Check holdings
Gets information like avg_buy_price, quantity with regard to all the holdings

```json
get /holdings
```

### Check returns
Calculates returns by considering current stock price as 100; Also returns the breakdown per stock 

```json
get /returns
```