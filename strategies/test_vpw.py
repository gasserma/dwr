import unittest

from assets import Assets
from simulator import runSimulation
from strategies.vpw import Vpw

'''
This is a big TODO. Right now this just detects runtime errors.
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
            2009
        )

        result.getSimResults()

        print(result)
