"""
The flask application package.
"""

import traceback
from flask import Flask
app = Flask(__name__)

from datetime import datetime
from flask import render_template

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
        return result.toJson()
    except ImportError as e:
        traceback.print_exc()
    except Exception as e:
        traceback.print_exc()

@app.route('/assets')
def assets():
    try:
        return "god damn it."
        from assets import Assets
        ass = Assets(.5, .5)
        return ass.__str__()
    except ImportError as e:
        return traceback.print_exc()
    except Exception as e:
        return traceback.print_exc()

@app.route('/test')
def test():
    return "iis is the least debuggable thing in the world"