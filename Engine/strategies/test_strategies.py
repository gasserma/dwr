import unittest

from Engine.portfolio import Portfolio
from Engine.strategies.constant_percent import *
from Engine.strategies.guyton_klinger import *

from Engine.assets import Assets
from Engine.simulation import runSimulation
from Engine.strategies.constant_amount import *

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

    def test_yearBase(self):
        length = 30
        gk = GuytonKlinger(.05, length)
        gk.reset(Portfolio(Assets(.5, .5)))

        # withdraw and grow once
        initialWithdrawal = gk.withdraw(1.0, 12)
        initialPortfolio = gk.getPortfolioValue()
        gk.grow(Assets(1.1, 1.1))

        # now do it 11 more times
        for i in range(1, 12):
            withdrawal = gk.withdraw(1.0, 12)
            gk.grow(Assets(1.1, 1.1))
            portfolio = gk.getPortfolioValue()
            self.assertAlmostEqual(withdrawal, initialWithdrawal, delta=.0005)
            self.assertAlmostEqual(portfolio, initialPortfolio, delta=.0005)

        # now do it 1 more time, which will trigger the new year calculations.
        grownWithdrawal = gk.withdraw(1.1, 12)
        gk.grow(Assets(1.1, 1.1))
        grownPortfolio = gk.getPortfolioValue()
        self.assertNotAlmostEqual(grownWithdrawal, initialWithdrawal, delta=.00005)
        self.assertNotAlmostEqual(grownPortfolio, initialPortfolio, delta=.00005)




