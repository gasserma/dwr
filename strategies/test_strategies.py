import unittest
from portfolio import Portfolio
from assets import Assets
from strategies.constant_amount import *
from simulation import runSimulation
from strategies.constant_percent import *

'''
This is a collection of tests that primarily verify the overall engine is functioning correctly.

They frequently overlap with the strategy specific tests.
'''
class TestStrategies(unittest.TestCase):
    def test_unitPortfolio(self):
        result = runSimulation(
            30,
            1.0,
            .04,
            (
                (ConstantWithdrawalAmountStrategy(.04), Assets(.5, .5), 1.0),
            ),
            1926,
            1997
        )

        self.assertAlmostEqual(result.getSuccessRate(), .95, delta=.005)


    def test_largePortfolio(self):
        i = 1000000
        result = runSimulation(
            30,
            i,
            i * 0.04,
            (
                (ConstantWithdrawalAmountStrategy(i * .04), Assets(.5, .5), 1.0),
            ),
            1926,
            1997
        )

        self.assertAlmostEqual(result.getSuccessRate(), .95, delta=.005)


    def test_multipleStrategies(self):
        i = 1000000
        result = runSimulation(
            30,
            i,
            i * 0.04,
            (
                (ConstantWithdrawalAmountStrategy(i * .04 * .6), Assets(.5, .5), .6),
                (ConstantWithdrawalAmountStrategy(i * .04 * .4), Assets(.5, .5), .4)
            ),
            1926,
            1997
        )

        self.assertAlmostEqual(result.getSuccessRate(), .95, delta=.005)



    def test_multipleDifferentStrategies(self):
        i = 1000000
        result = runSimulation(
            30,
            i,
            0.0,
            (
                (ConstantWithdrawalAmountStrategy(i * .04 * .5), Assets(.5, .5), .5),
                (ConstantPercentWithdrawalStrategy(.10), Assets(1.0, 0.0), .5)
            ),
            1926,
            2010
        )

        #it always works because you never run out with a percent withdrwawal strategy
        self.assertAlmostEqual(result.getSuccessRate(), 1.0, delta=.005)