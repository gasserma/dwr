import unittest

from flask import json

from __init__ import app

'''
Tests against the web work. Highly flask dependent.
'''
class TestWeb(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()

    def tearDown(self):
        pass

    def test_homeExists(self):
        rv = self.app.get('/')
        self.assertEqual(rv._status_code, 200)
        rv = self.app.get('/home')
        self.assertEqual(rv._status_code, 200)

    def test_faqExists(self):
        rv = self.app.get('/faq')
        self.assertEqual(rv._status_code, 200)

    def test_aboutExists(self):
        rv = self.app.get('/about')
        self.assertEqual(rv._status_code, 200)

    def test_eli5Exists(self):
        rv = self.app.get('/eli5')
        self.assertEqual(rv._status_code, 200)

    def test_playgroundExists(self):
        rv = self.app.get('/playground')
        self.assertEqual(rv._status_code, 200)

    def test_doesntExist(self):
        rv = self.app.get('/notarealpage')
        self.assertEqual(rv._status_code, 404)

    # this is just sitting here until we write an actual test for the simulations endpoint.
    def test_dbgPost(self):
        rv = self.app.post(
            "/dbg/posttest",
            data=json.dumps(dict(amount=100)),
            content_type="application/json")
        response = json.loads(rv.data)
        self.assertEqual(response["some_value"], 99)


    def test_trinityResultsWeb(self):
        initial_portfolio_value = 1 * 1000 * 1000
        strats = []
        strats.append(dict(
            weight=1.0,
            type="const_amount",
            args=dict(
                amount=.04 * initial_portfolio_value
            ),
            asset_allocation=[.5, .5]
        ))

        request = dict(
            initial_portfolio_value=initial_portfolio_value,
            retirement_length=30,
            failure_threshhold=0,
            min_year=1926,
            max_year=2010,
            strategies=strats,
        )

        jsonString=json.dumps(request)

        rv = self.app.post(
            "/simulations",
            data=jsonString,
            content_type="application/json")
        response = json.loads(rv.data)
        self.assertAlmostEqual(.96, float(response["success_rate"]), delta=.005)

    def test_simulations(self):
        initial_portfolio_value = 1 * 1000 * 1000
        strats = []
        strats.append(dict(
            weight=0.4,
            type="guyton_klinger",
            args=dict(
                initial_amount=.055 * initial_portfolio_value * .4
            ),
            asset_allocation=[.8, .2]
        ))

        strats.append(dict(
            weight=0.4,
            type="const_amount",
            args=dict(
                amount=.04 * initial_portfolio_value * .4
            ),
            asset_allocation=[.5, .5]
        ))

        strats.append(dict(
            weight=0.2,
            type="const_percentage",
            args=dict(
                percent=.04
            ),
            asset_allocation=[1.0, 0.0]
        ))

        request = dict(
            initial_portfolio_value=initial_portfolio_value,
            retirement_length=30,
            failure_threshhold=20*1000,
            min_year=1926,
            max_year=2010,
            strategies=strats,
        )

        jsonString=json.dumps(request)

        rv = self.app.post(
            "/simulations",
            data=jsonString,
            content_type="application/json")
        response = json.loads(rv.data)

        # not a precise assertion, we just want some reasonable regressions guards on the json shapes.
        # as of now the rate is like .96
        self.assertTrue(.90 < float(response["success_rate"]))

