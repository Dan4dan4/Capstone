from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import db,User, Portfolio, Stock, PortfolioStocks
from datetime import datetime
# from app.models.portfolio import update_total_value
# import logging
import yfinance as yf

stock_routes = Blueprint('stock', __name__)


@stock_routes.route('/<string:stock_ticker>', methods=['GET'])
def get_stock_info(stock_ticker):
    """
    Get stock info based on stock ticker NOT NAME
    """
    stock = yf.Ticker(stock_ticker)

    data = stock.info

    name = data.get('longName')
    price = data.get('currentPrice')
    industry = data.get('industry')
    description = data.get('longBusinessSummary')

    if price and industry and description:
        data = {
            'name': name,
            'price': price,
            'industry': industry,
            'description': description,
        }
        return jsonify(data), 200
    else:
        return jsonify({"error": "Please enter valid stock ticker"}), 404

@stock_routes.route('/buy/<string:stock_ticker>/<int:portfolio_id>', methods=['POST'])
@login_required
def purchase_stock(stock_ticker, portfolio_id):
    
    """
    Buy stock and add to portfolio
    """
    
    portfolio = Portfolio.query.filter_by(id= portfolio_id, user_id=current_user.id).first()
    
    if not portfolio:
        return jsonify({"error": "Portfolio not found for user"}), 404

    stock = yf.Ticker(stock_ticker)
    data = stock.info
    price = data.get('currentPrice')
    name = data.get('longName')
    industry = data.get('industry')
    description = data.get('longBusinessSummary')

    existing_stock = Stock.query.filter_by(name=name).first()  
    if not existing_stock:
        new_stock = Stock(name=name, price=price, industry=industry, description=description)
        db.session.add(new_stock)
        db.session.commit()
        existing_stock = new_stock

    quantity = request.json.get('quantity')
    if not quantity:
        return jsonify({"error", "Please provide quantity"}), 404
    
    totalcost = price * quantity

    if portfolio.balance < totalcost:
        return jsonify({"error": "Cannot complete order due to insufficient balance"}), 400
    
    portfolio.balance -= totalcost
    db.session.commit()

    stock_in_portfolio = PortfolioStocks.query.filter_by(portfolio_id=portfolio.id, stock_id=existing_stock.id).first()

    if stock_in_portfolio:
        stock_in_portfolio.quantity += quantity
    else:
        stock_in_portfolio = PortfolioStocks(
            portfolio_id=portfolio.id,
            stock_id=existing_stock.id,
            quantity=quantity,
            purchase_price=price,
            date_purchased=datetime.utcnow()
        )
        db.session.add(stock_in_portfolio)

    portfolio.update_total_value()
    db.session.commit()

    # if portfolio.total_value is None:
    #     portfolio.total_value = 0

    # portfolio.total_value += totalcost
    # db.session.commit()
    # db.session.refresh(portfolio)

    return jsonify({"message": "Stock purchased!",
                    "name": name,
                    "quantity": quantity,
                    "total_cost": totalcost,
                    # "portfolio": portfolio.to_dict()}
                    })