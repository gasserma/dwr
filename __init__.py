from flask import Flask
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