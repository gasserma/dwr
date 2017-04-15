import unittest

from assets import Assets
from simulation import runSimulation
from portfolio import Portfolio
from strategies.vpw import Vpw

'''
This is a set of tests that cover guyton klinger. They are much more granular given how complicated guyton klinger is.
'''
class TestVPW(unittest.TestCase):
    def test_basicWithdrawal(self):
        retirementLength = 30
        initialPortfolio = 1 * 1000 * 1000

        result = runSimulation(
            retirementLength,
            initialPortfolio,
            .05 * initialPortfolio * .5,
            (
                (Vpw(.04, retirementLength, .75), Assets(.5, .5), 1.0),
            ),
            1926,
            2010
        )

        result.getSimResults()

        print(result)
