"""
The flask application package.
"""

import traceback

import flask
from flask import Flask
app = Flask(__name__)

from datetime import datetime
from flask import render_template

@app.errorhandler(500)
def topLevel500(e):
    return flask.jsonify(status=500, exception=e.__str__(), trace=traceback.format_exc())

@app.errorhandler(Exception)
def topLevelError(e):
    return flask.jsonify(status=500, exception=e.__str__(), trace=traceback.format_exc())



@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return render_template(
        'index.html',
        title='Hi Emily',
        year=datetime.now().year,
    )

@app.route('/calc')
def calc():
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

@app.route('/assets')
def assets():
    try:
        from assets import Assets
        ass = Assets(.5, .5)
        return ass.__str__()
    except ImportError:
        return "ie"
    except Exception:
        return "e"

@app.route('/test')
def test():
    return "iis is the least debuggable thing in the world"

@app.route('/error')
def error():
    return 15/0.0

@app.route('/log')
def about():
    app.logger.warning('gasser flask warning')
    app.logger.error('gasser flask error')
    app.logger.info('gasser flask info')
    return "did some logging..."

