import unittest

from assets import Assets
from simulation import runSimulation
from portfolio import Portfolio
from strategies.hebeler_autopilot import HebelerAuto

'''
This is a set of tests that cover guyton klinger. They are much more granular given how complicated guyton klinger is.
'''
class TestHebeler(unittest.TestCase):
    def test_basicWithdrawal(self):
        retirementLength = 30
        initialPortfolio = 1 * 1000 * 1000

        result = runSimulation(
            retirementLength,
            initialPortfolio,
            .05 * initialPortfolio * .5,
            (
                (HebelerAuto(55), Assets(.5, .5), 1.0),
            ),
            1926,
            2010
        )

        result.getSimResults()

        print(result)
