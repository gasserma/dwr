import unittest

from assets import Assets
from portfolio import Portfolio
from simulator import runSimulation
from strategies.guyton_klinger import GuytonKlinger

class TestStrategies(unittest.TestCase):
    """This is a set of tests that cover guyton klinger.
    They are much more granular given how complicated guyton klinger is.
    """
    def test_basicWithdrawal(self):
        length = 30
        gk = GuytonKlinger(.05, True, True, True, True, length)
        gk.reset(Portfolio(Assets(.5, .5)))
        withdrawal = gk.yearWithdraw(1.0)
        self.assertAlmostEqual(withdrawal, .05, delta=.005)

        gk.reset(Portfolio(Assets(.5, .5)))
        monthlyWithdrawals = 0.0
        for i in range(0, 12):
            monthlyWithdrawals += gk.withdraw(1.0, 12)
        self.assertAlmostEqual(withdrawal, monthlyWithdrawals, delta=.005)

    def test_noOptions(self):
        retirementLength = 30

        result = runSimulation(
            retirementLength,
            1 * 1000 * 1000,
            20000,
            (
                (GuytonKlinger(40000, False, False, False, False, retirementLength), Assets(.5, .5), 1.0),
            ),
            1926,
            2009
        )

        result.getSimResults()

        print(result)




