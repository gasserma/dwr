from strategies.strategy_base import StrategyBase

# https://www.irs.gov/publications/p590b/index.html#en_US_2014_publink1000231236
# age................0.....1.....2.....3.....4.....5.....6.....7.....8.....9
lifeExpectancy = [82.4, 81.6, 80.6, 79.7, 78.7, 77.7, 76.7, 75.8, 74.8, 73.8,  # x 0
                  72.8, 71.8, 70.8, 69.9, 68.9, 67.9, 66.9, 66.0, 65.0, 64.0,  # x 10
                  63.0, 62.1, 61.1, 60.1, 59.1, 58.2, 57.2, 56.2, 55.3, 54.3,  # x 20
                  53.3, 52.4, 51.4, 50.4, 49.4, 48.5, 47.5, 46.5, 45.6, 44.6,  # x 30
                  43.6, 42.7, 41.7, 40.7, 39.8, 38.8, 37.9, 37.0, 36.0, 35.1,  # x 40
                  34.2, 33.3, 32.3, 31.4, 30.5, 29.6, 28.7, 27.9, 27.0, 26.1,  # x 50
                  25.2, 24.4, 23.5, 22.7, 21.8, 21.0, 20.2, 19.4, 18.6, 17.8,  # x 60
                  17.0, 16.3, 15.5, 14.8, 14.1, 13.4, 12.7, 12.1, 11.4, 10.8,  # x 70
                  10.2, 9.7,  9.1,  8.6,  8.1,  7.6,  7.1,  6.7,  6.3,  5.9,   # x 80
                  5.5,  5.2,  4.9,  4.6,  4.3,  4.1,  3.8,  3.6,  3.4,  3.1,   # x 90
                  2.9,  2.7,  2.5,  2.3,  2.1,  1.9,  1.7,  1.5,  1.4,  1.2,   # x 10
                  1.1,  1.0]                                                   # x 110

'''
http://www.marketwatch.com/story/put-retirement-savings-withdrawals-on-autopilot-2013-07-24
'''
from strategies.strategy_base import YearlyStrategyBase

class HebelerAuto(YearlyStrategyBase):
    def __init__(self, age):
        self.resetAge = age

    def getInitialWithDrawal(self):
        return self.initialAmount

    def getCurrentWithdrawalAmount(self):
        return self.lastYearsWithdrawal # using the parlance of the hebeler paper.

    def yearBaseReset(self, portfolio):
        self.portfolio = portfolio
        self.initialAmount = self.portfolio.value * .04
        self.lastYearsWithdrawal = self.initialAmount
        self.lastYearsAmount = self.portfolio.value
        self.age = self.resetAge

    def yearWithdraw(self, inflationRate):
        withdrawal = .5 * inflationRate * self.getInitialWithDrawal()
        withdrawal += .5 * self.lastYearsAmount / lifeExpectancy[self.age]

        self.lastYearsWithdrawal = withdrawal
        self.age += 1
        w = self.portfolio.withdraw(withdrawal)
        self.lastYearsAmount = self.yearGetPortfolioValue()
        return w

    def yearGetPortfolioValue(self):
        return self.portfolio.value

    def yearGrow(self, yearGrowth):
        self.portfolio.grow(yearGrowth)