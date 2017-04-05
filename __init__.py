"""
The flask application package.
"""
import os
import traceback
import logging
from logging.handlers import RotatingFileHandler

import flask
from flask import Flask, request
app = Flask(__name__)

# the logger is breaking unit tests...need to find a way of logging only for real
#handler = RotatingFileHandler('dwr.log', maxBytes=1000000, backupCount=3)
#handler.setLevel(logging.INFO)
#app.logger.addHandler(handler)

from flask import render_template
from simulation import runSimulation
from strategies.guyton_klinger import GuytonKlinger
from strategies.constant_amount import ConstantWithdrawalAmountStrategy
from strategies.constant_percent import ConstantPercentWithdrawalStrategy
from assets import Assets

# TODO standardize logging and exception handling here.
# TODO test these erro handlings
# TODO handle more than these...404 at least
# TODO, test this. It seems like it is returning a 200...
@app.errorhandler(500)
def topLevel500(e):
    return flask.jsonify(status=500, exception=e.__str__(), trace=traceback.format_exc())

@app.errorhandler(Exception)
def topLevelError(e):
    return flask.jsonify(status=500, exception=e.__str__(), trace=traceback.format_exc())

# Everything at /* is a page that you might visit except for...
#               /simulations* which is the rest endpoint you post to do run simulations and
#               /dbg* which is just gunk
#
@app.route('/')
@app.route('/home')
def home():
    return render_template(
        'index.html',
        title='Hi Emily' #TODO this banjo kazooie stuff is adding nothing
    )

@app.route('/about')
@app.route('/faq')
@app.route('/eli5')
@app.route('/playground')
def about():
    return "TODO"

@app.route("/simulations", methods=["POST"])
def simulations():
    minYear = int(request.json.get("min_year", 1926))
    maxYear = int(request.json.get("max_year", 2010))
    failureThreshhold = float(request.json.get("failure_threshhold", 20*1000))
    initialPortfolioValue = float(request.json.get("initial_portfolio_value", 1*1000*1000))
    retirementLength = int(request.json.get("retirement_length", 30))

    strategies = []
    for s in request.json["strategies"]:
        args = s["args"]
        allocation = [float(f) for f in s["asset_allocation"]]
        weight = float(s.get("weight", 1.0))
        type = s["type"]
        if type.lower() == "guyton_klinger":
            strategy = GuytonKlinger(float(args.get("initial_amount")), retirementLength)
        elif type.lower() == "const_amount":
            strategy = ConstantWithdrawalAmountStrategy(float(args["amount"]))
        elif type.lower() == "const_percent":
            strategy = ConstantPercentWithdrawalStrategy(float(args["percent"]))
        else:
            raise NotImplemented("Unrecognized strategy: {0}".format(type))

        strategies.append((strategy, Assets(allocation), weight))

    result = runSimulation(
        retirementLength,
        initialPortfolioValue,
        failureThreshhold,
        strategies,
        minYear,
        maxYear,
    )

    results = result.getSimResults()
    return flask.jsonify(
        success_rate=result.getSuccessRate(),
        initial_withdrawal_amt=results[0]["withdrawals"][0],
        simulation_start=minYear,
        simulation_end=maxYear,
        results=results
    )

@app.route('/dbg/calc')
def dbgCalc():
    retirementLength = 30
    initialPortfolio = 2 * 1000 * 1000

    try:
        from simulation import runSimulation
        from strategies.guyton_klinger import GuytonKlinger
        from assets import Assets
        result = runSimulation(
            retirementLength,
            initialPortfolio,
            .055 * initialPortfolio * .5,
            (
                (GuytonKlinger(.055 * initialPortfolio, retirementLength), Assets(.5, .5), 1.0),
            ),
            1926,
            2010
        )
        return flask.jsonify(success_rate=result.getSuccessRate())
    except ImportError:
        return "ie"
    except Exception:
        return "e"

@app.route("/dbg/posttest", methods=["POST"])
def dbgPostTest():
    amt = request.json["amount"]
    return flask.jsonify(some_value=int(amt)-1)

@app.route("/dbg/gk")
def dbgGk():
    return render_template(
        'gksim.html'
    )

@app.route("/dbg/gkexample")
def dbgGkExample():
    retirementLength = 30
    initialPortfolio = 1 * 1000 * 1000
    from simulation import runSimulation
    from strategies.guyton_klinger import GuytonKlinger
    from assets import Assets
    result = runSimulation(
        retirementLength,
        initialPortfolio,
        .055 * initialPortfolio * .5,
        (
            (GuytonKlinger(.055 * initialPortfolio, retirementLength), Assets(.5, .5), 1.0),
        ),
        1926,
        2010
    )
    return flask.jsonify(
        success_rate=result.getSuccessRate(),
        initial_withdrawal_amt=55000,
        simulation_start=1926,
        simulation_end=2010,
        results=result.getSimResults()
    )

@app.route('/dbg/log')
def dbgLog():
    app.logger.warning('gasser flask warning')
    app.logger.error('gasser flask error')
    app.logger.info('gasser flask info')
    return "did some logging..."

