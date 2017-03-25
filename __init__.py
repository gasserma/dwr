"""
The flask application package.
"""

from flask import Flask
app = Flask(__name__, template_folder="./FlaskWebServer/templates", static_folder="./FlaskWebServer/static")

from datetime import datetime
import sys
from flask import render_template

@app.route('/')
@app.route('/home')
def home():
    try:
        """Renders the home page."""
        return render_template(
            'index.html',
            title='Hi Emily',
            year=datetime.now().year,
        )
    except:  # catch *all* exceptions
        e = sys.exc_info()[0]
        return "<p>Error: {0}</p>".format(e)

@app.route('/calc')
def calc():
    try:
        retirementLength = 30
        initialPortfolio = 2 * 1000 * 1000

        from Engine.simulation import runSimulation
        from Engine.strategies.guyton_klinger import GuytonKlinger
        from Engine.assets import Assets
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
        return result.__str__()
    except:  # catch *all* exceptions
        e = sys.exc_info()[0]
        return "<p>Error: {0}</p>".format(e)



@app.route('/test')
def test():
    return "iis is the least debuggable thing in the world"