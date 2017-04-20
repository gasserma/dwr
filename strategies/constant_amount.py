from strategies.strategy_base import StrategyBase

'''
This is the implementation of the trinity study's constant withdrawal amount.
'''
class ConstantWithdrawalAmountStrategy(StrategyBase):
    def __init__(self, initialWithdrawal):
        self.initialWithdrawal = initialWithdrawal

    def getInitialWithDrawal(self):
        return self.initialWithdrawal

    def reset(self, portfolio):
        self.portfolio = portfolio

    def withdraw(self, inflationRate, numPeriodsPerYear):
        withdrawal = inflationRate * self.initialWithdrawal / numPeriodsPerYear
        return self.portfolio.withdraw(withdrawal)

    def getPortfolioValue(self):
        return self.portfolio.value

    def grow(self, monthGrowth):
         return self.portfolio.grow(monthGrowth)
