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
import markdown
from flask import Markup
from simulation import runSimulation
from strategies.guyton_klinger import GuytonKlinger
from strategies.constant_amount import ConstantWithdrawalAmountStrategy
from strategies.constant_percent import ConstantPercentWithdrawalStrategy
from strategies.hebeler_autopilot import HebelerAuto
from strategies.vpw import Vpw
from assets import Assets

# TODO standardize logging and exception handling here.
# TODO test these erro handlings
# TODO handle more than these...404 at least
@app.errorhandler(500)
def topLevel500(e):
    return flask.jsonify(exception=e.__str__(), trace=traceback.format_exc()), 500

@app.errorhandler(Exception)
def topLevelError(e):
    return flask.jsonify(exception=e.__str__(), trace=traceback.format_exc()), 500

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
def about():
    script = os.path.dirname(__file__)
    path = os.path.join(script, "./templates/about.md")
    f = open(path, mode="r").read()

    return render_template(
        'about.html',
        title='Hi Emily',
        content=Markup(markdown.markdown(f))
    )

@app.route('/faq')
def faq():
    script = os.path.dirname(__file__)
    path = os.path.join(script, "./templates/faq.md")
    f = open(path, mode="r").read()

    return render_template(
        'faq.html',
        title='Hi Emily',
        content=Markup(markdown.markdown(f))
    )

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
        elif type.lower() == "hebeler_autopilot":
            strategy = HebelerAuto(int(args["age"]))
        elif type.lower() == "vpw":
            strategy = Vpw(float(args["expected_return_percent"]), int(retirementLength), float(args["drawdown_percent"]))
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
    initialWithdrawal = results[0]["withdrawals"][0]
    if type.lower() == "const_percent":
        initialWithdrawal = initialPortfolioValue * float(args["percent"])
    if type.lower() == "guyton_klinger":
        initialWithdrawal = float(args.get("initial_amount"))

    return flask.jsonify(
        initial_withdrawal_amt=initialWithdrawal,
        simulation_start=minYear,
        simulation_end=maxYear,
        results=results,
        stats=result.getStats(),
        dist_stats=result.getDistStats(),
        yearly_stats=result.getYearlyStats()
    )

@app.route('/dbg/log')
def dbgLog():
    app.logger.warning('gasser flask warning')
    app.logger.error('gasser flask error')
    app.logger.info('gasser flask info')
    return "did some logging..."

