from FlaskWebServer.__init__ import app

@app.route('/test')
def test():
    return "iis is the least debuggable thing in the world"