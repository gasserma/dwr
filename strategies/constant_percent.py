from strategies.strategy_base import StrategyBase

'''
This is a withdrawal strategy that takes a constant percentage of the portfolio every period.
'''
class ConstantPercentWithdrawalStrategy(StrategyBase):
    def __init__(self, percent):
        self.percent = percent

    def getInitialWithDrawal(self):
        super(ConstantPercentWithdrawalStrategy, self).getInitialWithDrawal()
        return self.initialWithdrawal

    def reset(self, portfolio):
        super(ConstantPercentWithdrawalStrategy, self).reset(portfolio)
        self.portfolio = portfolio
        self.initialWithdrawal = portfolio.value * self.percent

    def withdraw(self, inflationRate, numPeriodsPerYear):
        super(ConstantPercentWithdrawalStrategy, self).withdraw(inflationRate, numPeriodsPerYear)
        withdrawal = self.portfolio.value * self.percent / numPeriodsPerYear
        self.portfolio.withdraw(withdrawal)
        # rebalance is implicit
        return withdrawal

    def getPortfolio(self):
        super(ConstantPercentWithdrawalStrategy, self).getPortfolio()
        return self.portfolio

    def grow(self, monthGrowth):
        super(ConstantPercentWithdrawalStrategy, self).grow(monthGrowth)
        self.portfolio.grow(monthGrowth)