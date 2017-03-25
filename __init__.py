from flask import Flask

#from simulation import runSimulation
from strategies.test_trinity import *
from strategies.guyton_klinger import *

app = Flask(__name__)

@app.route('/')
def son():
    return 'Hi Adam!'

@app.route('/ermy')
def wife():
    return 'Hi Love!'

@app.route('/cerble')
def mom():
    return 'Hi Mom!'

@app.route('/reeech')
def dad():
    return 'Hi Dad!'

@app.route('/calc')
def calc():
    retirementLength = 30
    initialPortfolio = 2 * 1000 * 1000

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