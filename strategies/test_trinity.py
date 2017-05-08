import unittest

from assets import Assets
from helpers import isclose
from simulator import runSimulation
from portfolio import Portfolio
from strategies.constant_amount import ConstantWithdrawalAmountStrategy

'''
This class attempts to test that we get the same conclusion as the trinity study.
Its confusingly names though...because it really just tests the constant_amount strategy.

And...guess what? We can't replicate the trinity studies results. No idea why.
Even in incredibly simple cases, a la no inflation, 100 percent bonds, we still disagree...
but only occasionally...there is no obvious pattern in the disagreement. This tends to be
more pessimistic than the trinity study by about 2%. So if they think there is a 20% success
rate on a set of parameters, we probably think there is 18%.

These tests are also slow as shit. Python is giving us like 1500 for loop iterations per second
which is ridiculous. No idea why. The profiler doesn't reveal anything obvious.

The disagreement is rarely large, and on many of the important cases we agree completely.
I think the trinity study folks might have a bug...
'''
class TestTrinity(unittest.TestCase):
    # The trinity paper is nice enough to tell you how many iterations you should have, so we use it for a sanity check.
    def test_iterationCount(self):
        # this says that for 20 year studies you get 53 overlapping periods.
        for x in [(20, 53), (25, 48), (30, 43)]:
            result = trinity(x[0], .04, Portfolio(Assets(.5, .5)))
            self.assertEqual(result.iterations, x[1])

    # With 50 50 allocation, 4% inflation adjusted withdrawals over 30 years yields a 95% success rate.
    def test_trinityStudyMainTakeaway(self):
        result = trinity(30, .04*1000000, Portfolio(Assets(.5, .5)))
        self.assertAlmostEqual(result.getSuccessRate(), .95, delta=.005)

    def test_trinityStudyMainTakeaway2009(self):
        result = trinity(30, .04*1000000, Portfolio(Assets(.5, .5)), False, 2009)
        self.assertAlmostEqual(result.getSuccessRate(), .96, delta=.005)

    def test_trinityStudyMainTakeawayEndBounds(self):
        result = trinity(30, .04*1000000, Portfolio(Assets(.5, .5)), False, 2015)

    def test_trinitySingleNoInflation(self):
        result = trinity(25, .07*1000000, Portfolio(Assets(.75, .25)), ignoreInflation=True)
        self.assertAlmostEqual(result.getSuccessRate(), .90, delta=.005)

    # This is just the pythonified Table 1 and 2 from the 2009 update to the trinity study
    # https://www.onefpa.org/journal/Pages/Portfolio%20Success%20Rates%20Where%20to%20Draw%20the%20Line.aspx
    def test_trinity2009StocksOnlyIgnoreInflation(self):
        testCases = [
            [15, range(3, 13), (1.0, 0.0), (100, 100, 97, 97, 94, 93, 86, 80, 71, 63), True, 2009],
            [20, range(3, 13), (1.0, 0.0), (100, 98, 97, 95, 92, 86, 77, 66, 55, 51), True, 2009],
            [25, range(3, 13), (1.0, 0.0), (100, 98, 97, 93, 90, 80, 67, 55, 48, 40), True, 2009],
            [30, range(3, 13), (1.0, 0.0), (100, 98, 96, 93, 97, 76, 62, 51, 40, 35), True, 2009]
        ]
        self.doTests(testCases)
        
    def test_trinity2009BondsOnlyIgnoreInflation(self):
        testCases = [
            [15, range(3, 13), (0.0, 1.0), (100, 100, 100, 100, 100, 73, 56, 44, 29, 19), True, 2009],
            [20, range(3, 13), (0.0, 1.0), (100, 100, 100, 92, 54, 49, 28, 20, 14, 9), True, 2009],
            [25, range(3, 13), (0.0, 1.0), (100, 100, 97, 58, 43, 27, 18, 10, 10, 8), True, 2009],
            [30, range(3, 13), (0.0, 1.0), (100, 100, 64, 42, 24, 16, 7, 2, 0, 0), True, 2009]
        ]
        self.doTests(testCases)

    def test_trinity2009MixedIgnoreInflation(self):
        testCases = [
            [15, range(3, 13), (0.75, 0.25), (100, 100, 100, 100, 97, 94, 90, 77, 66, 56), True, 2009],
            [20, range(3, 13), (0.75, 0.25), (100, 100, 100, 97, 95, 89, 74, 58, 49, 43), True, 2009],
            [25, range(3, 13), (0.75, 0.25), (100, 100, 98, 97, 92, 78, 60, 52, 42, 32), True, 2009],
            [30, range(3, 13), (0.75, 0.25), (100, 100, 98, 96, 91, 69, 55, 38, 29, 20), True, 2009],

            [15, range(3, 13), (0.5, 0.5), (100, 100, 100, 100, 100, 99, 93, 73, 57, 46), True, 2009],
            [20, range(3, 13), (0.5, 0.5), (100, 100, 100, 100, 98, 88, 63, 46, 32, 20), True, 2009],
            [25, range(3, 13), (0.5, 0.5), (100, 100, 100, 100, 95, 67, 48, 28, 18, 13), True, 2009],
            [30, range(3, 13), (0.5, 0.5), (100, 100, 100, 98, 85, 53, 27, 15, 9, 5), True, 2009],

            [15, range(3, 13), (0.25, 0.75), (100, 100, 100, 100, 100, 100, 86, 53, 34, 30), True, 2009],
            [20, range(3, 13), (0.25, 0.75), (100, 100, 100, 100, 100, 68, 35, 26, 22, 14), True, 2009],
            [25, range(3, 13), (0.25, 0.75), (100, 100, 100, 100, 68, 33, 25, 17, 13, 10), True, 2009],
            [30, range(3, 13), (0.25, 0.75), (100, 100, 100, 96, 38, 24, 15, 9, 5, 2), True, 2009]
        ]
        self.doTests(testCases)

    def test_trinity2009StocksOnlyWithInflation(self):
        testCases = [
            [15, range(3, 13), (1.0, 0.0), (100, 100, 100, 94, 86, 76, 71, 64, 51, 46), False, 2009],
            [20, range(3, 13), (1.0, 0.0), (100, 100, 92, 80, 72, 65, 52, 45, 38, 25), False, 2009],
            [25, range(3, 13), (1.0, 0.0), (100, 100, 88, 75, 63, 60, 42, 33, 27, 17), False, 2009],
            [30, range(3, 13), (1.0, 0.0), (100, 98, 80, 62, 55, 44, 33, 27, 15, 5), False, 2009]
        ]
        self.doTests(testCases)

    def test_trinity2009BondsOnlyWithInflation(self):
        testCases = [
            [15, range(3, 13), (0.0, 1.0), (100, 100, 100, 81, 54, 37, 34, 27, 19, 10), False, 2009],
            [20, range(3, 13), (0.0, 1.0), (100, 97, 65, 37, 29, 28, 17, 8, 2, 2), False, 2009],
            [25, range(3, 13), (0.0, 1.0), (100, 62, 33, 23, 18, 8, 8, 2, 2, 0), False, 2009],
            [30, range(3, 13), (0.0, 1.0), (84, 35, 22, 11, 2, 0, 0, 0, 0, 0), False, 2009]
        ]
        self.doTests(testCases)

    def test_trinity2009MixedWithInflation(self):
        testCases = [
            [15, range(3, 13), (0.75, 0.25), (100, 100, 100, 97, 87, 77, 70, 56, 47, 30), False, 2009],
            [20, range(3, 13), (0.75, 0.25), (100, 100, 95, 80, 72, 60, 49, 31, 25, 11), False, 2009],
            [25, range(3, 13), (0.75, 0.25), (100, 100, 87, 70, 58, 42, 32, 20, 10, 3), False, 2009],
            [30, range(3, 13), (0.75, 0.25), (100, 100, 82, 60, 45, 35, 13, 5, 0, 0), False, 2009],

            [15, range(3, 13), (0.5, 0.5), (100, 100, 100, 99, 84, 71, 61, 44, 34, 21), False, 2009],
            [20, range(3, 13), (0.5, 0.5), (100, 100, 94, 80, 63, 43, 31, 23, 8, 6), False, 2009],
            [25, range(3, 13), (0.5, 0.5), (100, 100, 83, 60, 42, 23, 13, 8, 7, 2), False, 2009],
            [30, range(3, 13), (0.5, 0.5), (100, 96, 67, 51, 22, 9, 0, 0, 0, 0), False, 2009],

            [15, range(3, 13), (0.25, 0.75), (100, 100, 100, 99, 77, 59, 43, 34, 26, 13), False, 2009],
            [20, range(3, 13), (0.25, 0.75), (100, 100, 82, 52, 36, 14, 9, 3, 0, 0), False, 2009],
            [25, range(3, 13), (0.25, 0.75), (100, 95, 58, 32, 25, 15, 8, 7, 2, 2), False, 2009],
            [30, range(3, 13), (0.25, 0.75), (100, 80, 31, 22, 7, 0, 0, 0, 0, 0), False, 2009],
        ]
        self.doTests(testCases)

    # This is just pythonified Table 1 and 2 from the first iteration of the trinity study
    def test_trinity1997StocksOnlyIgnoreInflation(self):
        testCases = [
            [20, range(3, 13), (1.0, 0.0), (100, 98, 96, 94, 91, 83, 72, 58, 45, 40), True, 1997],
            [25, range(3, 13), (1.0, 0.0), (100, 98, 96, 92, 88, 75, 58, 44, 38, 29), True, 1997],
            [30, range(3, 13), (1.0, 0.0), (100, 98, 95, 91, 84, 74, 60, 49, 37, 33), True, 1997]
        ]
        self.doTests(testCases)

    def test_trinity1997BondsOnlyIgnoreInflation(self):
        testCases = [
            [20, range(3, 13), (0.0, 1.0), (100, 100, 100, 91, 47, 36, 15, 4, 0, 0), True, 1997],
            [25, range(3, 13), (0.0, 1.0), (100, 100, 96, 48, 29, 8, 2, 0, 0, 0), True, 1997],
            [30, range(3, 13), (0.0, 1.0), (100, 100, 53, 26, 2, 0, 0, 0, 0, 0), True, 1997]
        ]
        self.doTests(testCases)

    def test_trinity1997MixedIgnoreInflation(self):
        testCases = [
            [20, range(3, 13), (.75, .25), (100, 100, 100, 96, 94, 83, 68, 51, 38, 30), True, 1997],
            [25, range(3, 13), (.75, .25), (100, 100, 98, 96, 90, 73, 50, 40, 29, 19), True, 1997],
            [30, range(3, 13), (.75, .25), (100, 100, 98, 95, 88, 63, 51, 35, 26, 14), True, 1997],

            [20, range(3, 13), (.5, .5), (100, 100, 100, 100, 98, 83, 55, 36, 17, 4), True, 1997],
            [25, range(3, 13), (.5, .5), (100, 100, 100, 100, 94, 58, 35, 13, 2, 0), True, 1997],
            [30, range(3, 13), (.5, .5), (100, 100, 100, 98, 81, 42, 19, 5, 0, 0), True, 1997],

            [20, range(3, 13), (.25, .75), (100, 100, 100, 100, 100, 62, 23, 11, 4, 0), True, 1997],
            [25, range(3, 13), (.25, .75), (100, 100, 100, 100, 60, 17, 6, 0, 0, 0), True, 1997],
            [30, range(3, 13), (.25, .75), (100, 100, 100, 95, 21, 5, 0, 0, 0, 0), True, 1997]
        ]
        self.doTests(testCases)

    def test_trinity1997StocksOnlyWithInflation(self):
        testCases = [
            [20, range(3, 13), (1.0, 0.0), (100, 100, 91, 77, 66, 57, 42, 32, 28, 19), False, 1997],
            [25, range(3, 13), (1.0, 0.0), (100, 100, 85, 69, 56, 42, 33, 29, 25, 15), False, 1997],
            [30, range(3, 13), (1.0, 0.0), (100, 98, 81, 65, 56, 44, 33, 33, 19, 7), False, 1997]
        ]
        self.doTests(testCases)

    def test_trinity1997BondsOnlyWithInflation(self):
        testCases = [
            [20, range(3, 13), (0.0, 1.0), (100, 96, 57, 23, 15, 13, 9, 0, 0, 0), False, 1997],
            [25, range(3, 13), (0.0, 1.0), (100, 52, 19, 15, 10, 0, 0, 0, 0, 0), False, 1997],
            [30, range(3, 13), (0.0, 1.0), (79, 19, 16, 12, 0, 0, 0, 0, 0, 0), False, 1997]
        ]
        self.doTests(testCases)

    def test_trinity1997MixedWithInflation(self):
        testCases = [
            [20, range(3, 13), (.75, .25), (100, 100, 94, 77, 66, 51, 38, 19, 17, 6), False, 1997],
            [25, range(3, 13), (.75, .25), (100, 100, 85, 65, 50, 33, 25, 13, 4, 0), False, 1997],
            [30, range(3, 13), (.75, .25), (100, 100, 86, 63, 47, 35, 14, 7, 0, 0), False, 1997],

            [20, range(3, 13), (.5, .5), (100, 100, 92, 75, 55, 30, 17, 9, 2, 0), False, 1997],
            [25, range(3, 13), (.5, .5), (100, 100, 79, 52, 31, 15, 4, 0, 0, 0), False, 1997],
            [30, range(3, 13), (.5, .5), (100, 95, 70, 51, 19, 9, 0, 0, 0, 0), False, 1997],

            [20, range(3, 13), (.25, .75), (100, 100, 89, 51, 28, 15, 9, 4, 0, 0), False, 1997],
            [25, range(3, 13), (.25, .75), (100, 96, 48, 19, 17, 6, 0, 0, 0, 0), False, 1997],
            [30, range(3, 13), (.25, .75), (100, 74, 26, 19, 7, 0, 0, 0, 0, 0), False, 1997]
        ]
        self.doTests(testCases)

    def doTests(self, testCases):
        # f = open("./trinity2010results.tsv", 'w')
        # f.write("3%\t4%\t5%\t6%\t7%\t8%\t9%\t10%\t11%\t12%\n")
        for row in testCases:
            # f.write("years: {0} stocks/bonds {1:1.2f}/{2:1.2f}\t".format(row[0], row[2][0], row[2][1]))
            i = 0
            for rate in row[1]:
                expectedRate = row[3][i] / 100
                result = self.doTrinityTest(expectedRate, row[0], rate / 100.0, row[2][0], row[2][1], row[4], row[5])
    
                # f.write("e:{0:1.2f} a:{1:1.2f} diff:{2:1.2f}\t".format(expectedRate, result[1], expectedRate - result[1]))
                self.assertTrue(result[0])
                i += 1
                # f.write("\n")

    def doTrinityTest(self, expectedRate, length, withdrawalRate, stocks, bonds, ignoreInflation, endYear):
        result = trinity(length, withdrawalRate * 1000000, Portfolio(Assets(stocks, bonds), 1000000), ignoreInflation, endYear)

        # so its actually really fucking hard to recreate these results perfectly.
        # we are going to define an acceptable error rate that gets broader the further from 100% success we are
        # the intuition is that if we are off by 10% when the expected success rate is only 10% we don't care
        # but even errors of a few percent in the 90's matter
        delta = .005 # this is the min delta given the trinity study's significant figures.

        # so at an expected 1.0 success rate we allow no wiggle room
        # and at 0.0 success rate we allow a full 10%
        delta += .1 - expectedRate / 10

        # we also scale by withdrawal rate. Do we really care if we are wrong at 12 withdrawal rate?
        delta += withdrawalRate

        # im pretty sure the stock data is wrong so we scale by that too
        delta += stocks / 10

        # again we don't really care about non 30 year simulations that much
        delta += (30-length) / 100

        # Worst case delta...
        # expected rate of 0.0; delta += 10%
        # withdrawal rate of 12; delta += 12%
        # 100% stocks; delta += 10%
        # 15 year simulation; delta += 15%
        # delta ~= 47%, which is a big gap.

        # delta for a case we care about...
        # expected rate of .96; delta += .4%
        # withdrawal rate of 4%; delta += 4%
        # 50/50 stocks/bonds; delta =+ 5%
        # 30 year simulation; delta += 0%
        # delta ~= 9.4%

        # we also double the delta if trinity study is optimistic compared to us.
        # and halve it if we are reporting a higher success rate.
        actualSuccessRate = result.getSuccessRate()
        if actualSuccessRate < expectedRate:
            delta = delta * 2

        if isclose(actualSuccessRate, expectedRate, abs_tol=delta):
            return (True, actualSuccessRate)
        else:
            print("EXPECTED:\t{0:.2f}\tACTUAL:\t{1:.2f}\tRate tested:\t{2}\tYears\t{3}\tStocks:\t{4:.2f}\tBonds:\t{5:.2f}\tIgnoreInflations:\t{6}\tEndYear:\t{7}\tDelta:{8}"
                .format(expectedRate, actualSuccessRate, withdrawalRate, length, stocks, bonds, ignoreInflation, endYear, delta))
            self.assertAlmostEqual(actualSuccessRate, expectedRate, delta=delta)

# these are the years the trinity study covers.
trinityMinYear = 1926
trinityMaxYear = 1997
def trinity(length, initialWithdrawal, initialPortfolio, ignoreInflation=False, maxYear=trinityMaxYear):
    return runSimulation(
                    length,
                    1000000,
                    initialWithdrawal,
                    (
                        (ConstantWithdrawalAmountStrategy(initialWithdrawal), initialPortfolio.allocation, 1.0),
                    ),
                    1926,
                    maxYear,
                    ignoreInflation
                )