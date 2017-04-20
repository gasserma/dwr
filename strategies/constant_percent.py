from strategies.strategy_base import StrategyBase

'''
This is a withdrawal strategy that takes a constant percentage of the portfolio every period.
'''
class ConstantPercentWithdrawalStrategy(StrategyBase):
    def __init__(self, percent):
        self.percent = percent

    def getInitialWithDrawal(self):
        return self.initialWithdrawal

    def reset(self, portfolio):
        self.portfolio = portfolio
        self.initialWithdrawal = portfolio.value * self.percent

    def withdraw(self, inflationRate, numPeriodsPerYear):
        withdrawal = self.portfolio.value * self.percent / numPeriodsPerYear
        self.portfolio.withdraw(withdrawal)
        # rebalance is implicit
        return withdrawal

    def getPortfolioValue(self):
        return self.portfolio.value

    def grow(self, monthGrowth):
        self.portfolio.grow(monthGrowth)