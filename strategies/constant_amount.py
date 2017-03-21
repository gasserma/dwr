from strategies.strategy_base import StrategyBase

'''
This is the implementation of the trinity study's constant withdrawal amount.
'''
class ConstantWithdrawalAmountStrategy(StrategyBase):
    def __init__(self, initialWithdrawal):
        self.initialWithdrawal = initialWithdrawal

    def getInitialWithDrawal(self):
        super(ConstantWithdrawalAmountStrategy, self).getInitialWithDrawal()
        return self.initialWithdrawal

    def reset(self, portfolio):
        super(ConstantWithdrawalAmountStrategy, self).reset(portfolio)
        self.portfolio = portfolio

    def withdraw(self, inflationRate, numPeriodsPerYear):
        super(ConstantWithdrawalAmountStrategy, self).withdraw(inflationRate, numPeriodsPerYear)
        withdrawal = inflationRate * self.initialWithdrawal / numPeriodsPerYear
        return self.portfolio.withdraw(withdrawal)

    def getPortfolioValue(self):
        super(ConstantWithdrawalAmountStrategy, self).getPortfolioValue()
        return self.portfolio.value

    def grow(self, monthGrowth):
        super(ConstantWithdrawalAmountStrategy, self).grow(monthGrowth)
        self.portfolio.grow(monthGrowth)
